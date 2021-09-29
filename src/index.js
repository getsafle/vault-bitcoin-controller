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

    console.log("extendedKeys", extendedKeys.toBase58(), extendedKeys.neutered().toBase58() )

    const { address } = helpers.utils.generateAddress(extendedKeys, helpers.utils.getNetwork(network), 0)

    this.address = address

    // const hdWallet = hdkey.fromMasterSeed(seed)
    // const root = hdWallet.derive(this.hdPath)
    // this.wallet = root.deriveChild("m/0'")

    // const pubkey = Buffer.from(this.wallet.publicKey.toString('hex'), 'hex')
    // const privkey = Buffer.from(this.wallet.privateKey.toString('hex'), 'hex')
    // const { address: legacyAddress } = await bitcoinjs.payments.p2pkh({ network: helpers.utils.getNetwork(network), pubkey })
    // this.address = legacyAddress;

    // console.log("privkey ", privkey, this.wallet.privateKey, this.wallet.privateKey.toString('hex'))
    // console.log("this.wallet.privateExtendedKey", this.wallet.privateExtendedKey, this.wallet.privateExtendedKey.toString('hex'))
    // console.log("this.wallet.publicExtendedKey", this.wallet.publicExtendedKey, this.wallet.publicExtendedKey.toString('hex'))
    return { wallet: this.wallet, address: this.address }
  }

  async exportPrivateKey(network) {
    const { address, privkey } = helpers.utils.generateAddress(this.wallet, helpers.utils.getNetwork(network), 0)

    // const privateKey = this.wallet._privateKey.toString('hex');
    // const pair = bitcoinjs.ECPair.fromPrivateKey(this.wallet._privateKey, { network: helpers.utils.getNetwork(network) })
    // const { address } = bitcoinjs.payments.p2pkh({ network: helpers.utils.getNetwork(network), pubkey: pair.publicKey });

    return { privateKey: privkey };
  }

  /**
 * NATIVE_TRANSFER : { data : {to, amount}, txnType: NATIVE_TRANSFER }
 *     
 */
  /**
   *  
   * @param {object: NATIVE_TRANSFER } transaction 
   * @param {string} connectionUrl | NETWORK = MAINNET 
   * @returns 
   */
  async signTransaction(transaction, connectionUrl) {
    const { data: { to, amount }, txnType } = transaction

    const URL = `https://sochain.com/api/v2/get_tx_unspent/${connectionUrl === TESTNET.NETWORK ? 'BTCTEST' : "BTC"}/${this.address}`
    // const utxos = await axios.get(URL);

    // console.log("utxos.data.data.txs ", utxos, utxos.data.data.txs, this.address)

    // const utxoId = utxos.data.data.txs[0].txid

    // const keyPair = bitcoinjs.ECPair.fromPrivateKey(this.wallet.privateKey, { network: helpers.utils.getNetwork(connectionUrl) })
    const { address, privkey } = helpers.utils.generateAddress(this.wallet, helpers.utils.getNetwork(connectionUrl), 0)

    // var tx = new bitcoinjs.TransactionBuilder(helpers.utils.getNetwork(connectionUrl));
    // var tx = new bitcoinjs.Psbt({ network: helpers.utils.getNetwork(connectionUrl) })
    // TransactionBuilder(helpers.utils.getNetwork(connectionUrl));
    if (txnType === NATIVE_TRANSFER) {
      const signedTransaction = await helpers.signTransaction(this.address, to, amount, URL, privkey)
      return { signedTransaction };
      // utxos.data.data.txs.forEach((val, key) => tx.addInput({ hash: val.txid, index: output_no }))
      // // tx.addInput(utxoId, 0)
      // tx.addOutput({ address: to, value: amount })
      // tx.signAllInputs(keyPair);
      // // tx.signInput(0, keyPair);
      // tx.validateSignaturesOfAllInputs()
      // tx.finalizeAllInputs();
      // return { signedTransaction: tx.extractTransaction().toHex() };
    }
  }

  async signMessage(message, connectionUrl) {
    const { wallet } = helpers.utils.generateAddress(this.wallet, helpers.utils.getNetwork(connectionUrl), 0)
    var signature = bitcoinMessage.sign(message, wallet.privateKey, wallet.compressed, { extraEntropy: randomBytes(32) })

    return { signedMessage: signature.toString('base64') };
  }

  async getAccounts() {
    return { address: this.wallet }
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
}

module.exports = BTCHdKeyring
