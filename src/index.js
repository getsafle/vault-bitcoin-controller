const ObservableStore = require('obs-store')

const bitcoinjs = require('bitcoinjs-lib')
const bitcoinMessage = require('bitcoinjs-message')
const bip39 = require('bip39')
const { randomBytes } = require('crypto')
const axios = require("axios");

const helpers = require('./helper/index')

const { bitcoin: { HD_PATH }, bitcoin_transaction: { NATIVE_TRANSFER }, bitcoin_network: { MAINNET, TESTNET } } = require('./config/index')


class BTCHdKeyring {

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
    const { from, to, amount } = transaction
    const idx = address.indexOf(from)
    if (idx < 0)
      throw "Invalid address, the address is not available in the wallet"
    const URL = `https://sochain.com/api/v2/get_tx_unspent/${networkType === TESTNET.NETWORK ? 'BTCTEST' : "BTC"}/${from}`
    const { privkey } = helpers.utils.generateAddress(wallet, network, idx)
    try {
      const signedTransaction = await helpers.signTransaction(from, to, amount, URL, privkey)
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

  async sendTransaction(rawTransaction) {
    const { networkType } = this.store.getState()
    try {
      const result = await axios({
        method: "POST",
        url: `https://sochain.com/api/v2/send_tx/${networkType === TESTNET.NETWORK ? 'BTCTEST' : "BTC"}`,
        data: {
          tx_hex: rawTransaction,
        },
      });
      return { transactionDetails: result && result.data && result.data.data ? result.data.data.txid : result }
    } catch (err) {
      throw err
    }
  }

  async getFee(address) {
    const { networkType } = this.store.getState()
    try {
      const URL = `https://sochain.com/api/v2/get_tx_unspent/${networkType === TESTNET.NETWORK ? 'BTCTEST' : "BTC"}/${address}`
      const { totalAmountAvailable, inputs, fee } = await helpers.getFeeAndInput(URL)
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

module.exports = BTCHdKeyring
