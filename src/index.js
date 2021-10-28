const bitcoinjs = require('bitcoinjs-lib')
const bitcoinMessage = require('bitcoinjs-message')
const bip39 = require('bip39')
const { randomBytes } = require('crypto')
const axios = require("axios");

const helpers = require('./helper/index')

const { bitcoin: { HD_PATH }, bitcoin_transaction: { NATIVE_TRANSFER }, bitcoin_network: { MAINNET, TESTNET } } = require('./config/index')


class BTCHdKeyring {
  constructor(mnemonic) {
    this.mnemonic = mnemonic
    this.hdPath = HD_PATH
    this.wallet = null
    this.address = null
  }

  async generateWallet(network) {
    const seed = bip39.mnemonicToSeed(this.mnemonic)

    // bip32RootKey
    const bip32RootKey = bitcoinjs.bip32.fromSeed(seed, helpers.utils.getNetwork(network));
    const extendedKeys = helpers.utils.calcBip32ExtendedKeys(bip32RootKey)

    this.wallet = extendedKeys

    const { address } = helpers.utils.generateAddress(extendedKeys, helpers.utils.getNetwork(network), 0)

    this.address = address

    return { wallet: this.wallet, address: this.address }
  }

  async exportPrivateKey(network) {
    const { address, privkey } = helpers.utils.generateAddress(this.wallet, helpers.utils.getNetwork(network), 0)

    return { privateKey: privkey };
  }

  /**
 * NATIVE_TRANSFER : { data : {to, amount}}
 *     
 */
  /**
   *  
   * @param {object: NATIVE_TRANSFER } transaction 
   * @param {string} connectionUrl | NETWORK = MAINNET 
   * @returns 
   */
  async signTransaction(transaction, connectionUrl) {
    const { data: { to, amount } } = transaction

    const URL = `https://sochain.com/api/v2/get_tx_unspent/${connectionUrl === TESTNET.NETWORK ? 'BTCTEST' : "BTC"}/${this.address}`
    const { address, privkey } = helpers.utils.generateAddress(this.wallet, helpers.utils.getNetwork(connectionUrl), 0)
    const signedTransaction = await helpers.signTransaction(this.address, to, amount, URL, privkey)
    return { signedTransaction };
  }

  async signMessage(message, connectionUrl) {
    const { wallet } = helpers.utils.generateAddress(this.wallet, helpers.utils.getNetwork(connectionUrl), 0)
    var signature = bitcoinMessage.sign(message, wallet.privateKey, wallet.compressed, { segwitType: 'p2wpkh', extraEntropy: randomBytes(32) })

    return { signedMessage: signature.toString('base64') };
  }

  async getAccounts(network) {
    const { address } = helpers.utils.generateAddress(extendedKeys, helpers.utils.getNetwork(network), 0)

    return { address }
  }

  async sendTransaction(rawTransaction, connectionUrl) {

    const result = await axios({
      method: "POST",
      url: `https://sochain.com/api/v2/send_tx/${connectionUrl === TESTNET.NETWORK ? 'BTCTEST' : "BTC"}`,
      data: {
        tx_hex: rawTransaction,
      },
    });

    return { transactionDetails: result }

  }

  async getFee(connectionUrl) {
    const URL = `https://sochain.com/api/v2/get_tx_unspent/${connectionUrl === TESTNET.NETWORK ? 'BTCTEST' : "BTC"}/${this.address}`
    const { totalAmountAvailable, inputs, fee } = await helpers.getFeeAndInput(URL)
    return { transactionFees: fee }
  }
}

module.exports = BTCHdKeyring
