const ObservableStore = require('obs-store')

const bitcoinjs = require('bitcoinjs-lib')
const bitcoinMessage = require('bitcoinjs-message')
const bip39 = require('bip39')
const { randomBytes } = require('crypto')
const axios = require("axios");

const helpers = require('./helper/index')

const { bitcoin: { HD_PATH_MAINNET, HD_PATH_TESTNET }, bitcoin_transaction: { NATIVE_TRANSFER }, bitcoin_network: { MAINNET, TESTNET }} = require('./config/index')
const { SOCHAIN_API_KEY, SOCHAIN_BASE_URL } = require('./constants/index')

class KeyringController {

  /**
   * 
   * @param {mnemonic, network} opts
   * network = TESTNET | MAINNET 
   */
  constructor(opts) {
    this.store = new ObservableStore({ mnemonic: opts.mnemonic, hdPath: opts.network === TESTNET.NETWORK ? HD_PATH_TESTNET : HD_PATH_MAINNET, network: helpers.utils.getNetwork(opts.network), networkType: opts.network ? opts.network : MAINNET.NETWORK, wallet: null, address: [] })
    this.generateWallet()
    this.importedWallets = []
  }

  generateWallet() {
    const { mnemonic, network, hdPath } = this.store.getState();
    const seed = bip39.mnemonicToSeed(mnemonic)
    const bip32RootKey = bitcoinjs.bip32.fromSeed(seed, network);
    const extendedKeys = helpers.utils.calcBip32ExtendedKeys(bip32RootKey, hdPath)
    this.updatePersistentStore({ wallet: extendedKeys })
    return extendedKeys
  }

  async addAccount() {
    const { wallet, network, address } = this.store.getState();
    const { address: _address } = helpers.utils.generateAddress(wallet, network, address.length)
    this.persistAllAddress(_address)
    return { address: _address }
  }


  async getAccounts() {
    const { address } = this.store.getState();
    return address
  }

  async exportPrivateKey(_address) {
    const { wallet, network, address } = this.store.getState()
    const idx = address.indexOf(_address)
    if (idx < 0)
      throw "Invalid address, the address is not available in the wallet"
    const { privkey } = helpers.utils.generateAddress(wallet, network, idx)
    return { privateKey: privkey };
  }

  async importWallet(_privateKey) {
    try {
      const { network } = this.store.getState()
      const address = helpers.utils.getAddressFromPk(_privateKey, network)
      this.importedWallets.push(address);
      return address
    } catch (e) {
      return Promise.reject(e)
    }
  }

  /**
 * NATIVE_TRANSFER : {from, to, amount}
 *     
 */
  /**
   *  
   * @param {object: NATIVE_TRANSFER } transaction 
   * @returns 
   */
  async signTransaction(transaction, _privateKey = null) {
    const { wallet, network, address, networkType } = this.store.getState()
    const { from, to, amount, satPerByte } = transaction
    let privateKey = _privateKey
    if (!privateKey) {
      const idx = address.indexOf(from)
      if (idx < 0)
        throw "Invalid address, the address is not available in the wallet"
      
      let res = helpers.utils.generateAddress(wallet, network, idx)
      privateKey = res.privkey
    }
    
    const URL = SOCHAIN_BASE_URL + `unspent_outputs/${networkType === TESTNET.NETWORK ? 'BTCTEST' : "BTC"}/${from}`
    const headers = { "API-KEY": SOCHAIN_API_KEY}
    
    try {
      const signedTransaction = await helpers.signTransaction(from, to, amount, URL, privateKey, satPerByte, headers)
      return { signedTransaction };
    } catch (err) {
      throw err
    }
  }

  async signMessage(message, _address, privateKey = null) {
    const { wallet, network, address } = this.store.getState()
    
    

    if (!privateKey) {
      const idx = address.indexOf(_address);
      if (idx < 0)
        throw "Invalid address, the address is not available in the wallet"
      
      try {
        const { wallet: _wallet } = helpers.utils.generateAddress(wallet, network, idx)
        var signature = bitcoinMessage.sign(message, _wallet.privateKey, _wallet.compressed, { segwitType: 'p2wpkh', extraEntropy: randomBytes(32) })
        return { signedMessage: signature.toString('base64') };
      } catch (err) {
        throw err
      }
    
    }
    else {
      const ec_pair = bitcoinjs.ECPair.fromWIF(privateKey)
      var signature = bitcoinMessage.sign(message, ec_pair.privateKey, ec_pair.compressed, { segwitType: 'p2wpkh', extraEntropy: randomBytes(32) })
      return { signedMessage: signature.toString('base64') };
    }
    
  }

  async sendTransaction(TransactionHex) {
    const { networkType } = this.store.getState()
    try {
      const headers = { "API-KEY": SOCHAIN_API_KEY}
      const result = await axios({
        method: "POST",
        url: SOCHAIN_BASE_URL + `broadcast_transaction/${networkType === TESTNET.NETWORK ? 'BTCTEST' : "BTC"}`,
        data: {
          tx_hex: TransactionHex,
        },
        headers: headers,
      });
      return { transactionDetails: result && result.data && result.data.data ? result.data.data.hash : result }
    } catch (err) {
      throw err
    }
  }


  async getFees(rawTransaction) {
    const { networkType } = this.store.getState()
    const { from } = rawTransaction

    try {
      const headers = { "API-KEY": SOCHAIN_API_KEY}

      const URL = SOCHAIN_BASE_URL + "network_info/" + `${networkType === TESTNET.NETWORK ? 'BTCTEST' : "BTC"}`
      const response = await axios({
        url : `${URL}`,
        method: 'GET',
        headers: headers,
      });

      let blocks = response.data.data['mempool'].blocks.slice(0,3)

      let fees = {
        slow: {
          satPerByte: parseInt(blocks[2].median_fee_rate),
        },
        standard: {
          satPerByte: parseInt(blocks[1].median_fee_rate),
        },
        fast: {
          satPerByte: parseInt(blocks[0].median_fee_rate)
        }
      }

      // get transaction size
      const sochainURL = SOCHAIN_BASE_URL + `unspent_outputs/${networkType === TESTNET.NETWORK ? 'BTCTEST' : "BTC"}/${from}`

      let { transactionSize } = await helpers.getTransactionSize(sochainURL, headers)

      return {
        transactionSize,
        fees
      }
    } catch (err) {
      throw err
    }
  }

  persistAllAddress(_address) {
    const { address } = this.store.getState()
    const newAdd = address
    newAdd.push(_address)
    this.store.updateState({ address: newAdd })
    return true
  }
  updatePersistentStore(obj) {
    this.store.updateState(obj)
    return true
  }

}

const getBalance = async (address, networkType) => {
  try {
    const URL = SOCHAIN_BASE_URL + `balance/${networkType === TESTNET.NETWORK ? 'BTCTEST' : "BTC"}/${address}`
    const headers = { "API-KEY": SOCHAIN_API_KEY}
    const balance = await axios({
      url : `${URL}`,
      method: 'GET',
      headers: headers
  });
    return { balance: balance.data.data.confirmed }
  } catch (err) {
    throw err
  }
}

module.exports = { KeyringController, getBalance }
