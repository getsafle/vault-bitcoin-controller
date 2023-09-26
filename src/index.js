const ObservableStore = require('obs-store')

const bitcoinjs = require('bitcoinjs-lib')
const bitcoinMessage = require('bitcoinjs-message')
const bip39 = require('bip39')
const { randomBytes } = require('crypto')
const axios = require("axios");

const helpers = require('./helper/index')

const { bitcoin: { HD_PATH }, bitcoin_transaction: { NATIVE_TRANSFER }, bitcoin_network: { MAINNET, TESTNET }, SOCHAIN_API_KEY } = require('./config/index')

class KeyringController {

  /**
   * 
   * @param {mnemonic, network} opts
   * network = TESTNET | MAINNET 
   */
  constructor(opts) {
    this.store = new ObservableStore({ mnemonic: opts.mnemonic, hdPath: HD_PATH, network: helpers.utils.getNetwork(opts.network), networkType: opts.network ? opts.network : MAINNET.NETWORK, wallet: null, address: [] })
    this.generateWallet()
    this.importedWallets = []
  }

  generateWallet() {
    const { mnemonic, network } = this.store.getState();
    const seed = bip39.mnemonicToSeed(mnemonic)
    const bip32RootKey = bitcoinjs.bip32.fromSeed(seed, network);
    const extendedKeys = helpers.utils.calcBip32ExtendedKeys(bip32RootKey)
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
  async signTransaction(transaction) {
    const { wallet, network, address, networkType } = this.store.getState()
    const { from, to, amount, satPerByte } = transaction
    const idx = address.indexOf(from)
    if (idx < 0)
      throw "Invalid address, the address is not available in the wallet"
    const URL = `https://sochain.com/api/v3/unspent_outputs/${networkType === TESTNET.NETWORK ? 'BTCTEST' : "BTC"}/${from}`
    const headers = { "API-KEY": SOCHAIN_API_KEY}
    const { privkey } = helpers.utils.generateAddress(wallet, network, idx)
    try {
      const signedTransaction = await helpers.signTransaction(from, to, amount, URL, privkey, satPerByte, headers)
      return { signedTransaction };
    } catch (err) {
      throw err
    }
  }

  async signMessage(message, _address) {
    const { wallet, network, address } = this.store.getState()
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

  async sendTransaction(TransactionHex) {
    const { networkType } = this.store.getState()
    try {
      const headers = { "API-KEY": SOCHAIN_API_KEY}
      const result = await axios({
        method: "POST",
        url: `https://chain.so/api/v3/broadcast_transaction/${networkType === TESTNET.NETWORK ? 'BTCTEST' : "BTC"}`,
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

  async getFee(address, satPerByte) {
    const { networkType } = this.store.getState()
    try {
      const URL = `https://sochain.com/api/v3/unspent_outputs/${networkType === TESTNET.NETWORK ? 'BTCTEST' : "BTC"}/${address}`
      const headers = { "API-KEY": SOCHAIN_API_KEY}
      const { totalAmountAvailable, inputs, fee } = await helpers.getFeeAndInput(URL, satPerByte, headers)
      return { transactionFees: fee }
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
    const URL = `https://sochain.com/api/v3/balance/${networkType === TESTNET.NETWORK ? 'BTCTEST' : "BTC"}/${address}`
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
