const { EventEmitter } = require('events')
const log = require('loglevel')
const ObservableStore = require('obs-store')
const encryptor = require('browser-passworder')

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
    this.store = new ObservableStore({ mnemonic: opts.mnemonic, hdPath: HD_PATH, network: helpers.utils.getNetwork(opts.network), networkType: opts.network, wallet: null, address: [] })
    this.generateWallet()
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
    const { privkey } = helpers.utils.generateAddress(wallet, network, idx)
    return { privateKey: privkey };
  }

  /**
 * NATIVE_TRANSFER : { data : {from, to, amount}}
 *     
 */
  /**
   *  
   * @param {object: NATIVE_TRANSFER } transaction 
   * @returns 
   */
  async signTransaction(transaction) {
    const { wallet, network, address, networkType } = this.store.getState()
    const { data: { from, to, amount } } = transaction
    const idx = address.indexOf(from)
    const URL = `https://sochain.com/api/v2/get_tx_unspent/${networkType === TESTNET.NETWORK ? 'BTCTEST' : "BTC"}/${from}`
    const { privkey } = helpers.utils.generateAddress(wallet, network, idx)
    const signedTransaction = await helpers.signTransaction(from, to, amount, URL, privkey)
    return { signedTransaction };
  }

  async signMessage(message, _address) {
    const { wallet, network, address } = this.store.getState()
    const idx = address.indexOf(_address);
    const { wallet: _wallet } = helpers.utils.generateAddress(wallet, network, idx)
    var signature = bitcoinMessage.sign(message, _wallet.privateKey, _wallet.compressed, { segwitType: 'p2wpkh', extraEntropy: randomBytes(32) })
    return { signedMessage: signature.toString('base64') };
  }

  async sendTransaction(rawTransaction) {
    const { networkType } = this.store.getState()
    const result = await axios({
      method: "POST",
      url: `https://sochain.com/api/v2/send_tx/${networkType === TESTNET.NETWORK ? 'BTCTEST' : "BTC"}`,
      data: {
        tx_hex: rawTransaction,
      },
    });
    return { transactionDetails: result && result.data && result.data.data ? result.data.data.txid : result }

  }

  async getFee(address) {
    const { networkType } = this.store.getState()
    const URL = `https://sochain.com/api/v2/get_tx_unspent/${networkType === TESTNET.NETWORK ? 'BTCTEST' : "BTC"}/${address}`
    const { totalAmountAvailable, inputs, fee } = await helpers.getFeeAndInput(URL)
    return { transactionFees: fee }
  }

  /**
     * Persist All Keyrings
     *
     * Iterates the current `keyrings` array,
     * serializes each one into a serialized array,
     * encrypts that array with the provided `password`,
     * and persists that encrypted string to storage.
     *
     * @param {string} password - The keyring controller password.
     * @returns {Promise<boolean>} Resolves to true once keyrings are persisted.
     */
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
