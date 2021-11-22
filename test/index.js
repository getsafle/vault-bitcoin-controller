var assert = require('assert');
const bitcoinMessage = require('bitcoinjs-message')
const Bitcoin = require('../src/index')
const {
    HD_WALLET_12_MNEMONIC,
    HD_WALLET_12_MNEMONIC_TEST_OTHER,
    TESTING_MESSAGE_1,
    TESTING_MESSAGE_2,
    TESTING_MESSAGE_3,
    BITCOIN_NETWORK: {
        TESTNET,
        MAINNET
    },
    TRANSFER_BTC: {
        BTC_AMOUNT,
        BTC_RECEIVER
    }
} = require('./constants')

const BTC_TXN_PARAM = {
    transaction: {
        data: {
            to: BTC_RECEIVER,
            amount: BTC_AMOUNT,
        }
    },
    connectionUrl: TESTNET
}

describe('Initialize wallet ', () => {
    const bitcoinWallet = new Bitcoin(HD_WALLET_12_MNEMONIC)

    it("Should have correct mnemonic", () => {
        assert.equal(bitcoinWallet.mnemonic, HD_WALLET_12_MNEMONIC, "Incorrect hd wallet")
    })

    it("Should generateWallet ", async () => {
        assert(bitcoinWallet.address === null)
        const wallet = await bitcoinWallet.generateWallet(TESTNET)
        console.log("wallet, ", wallet)
        assert(bitcoinWallet.address !== null)
    })

    it("Should get privateKey ", async () => {
        const privateKey = await bitcoinWallet.exportPrivateKey(TESTNET)
        console.log("privateKey, ", privateKey)
    })

    it("Should get account ", async () => {
        const accounts = await bitcoinWallet.getAccounts()
        console.log("accounts, ", accounts)
    })

    it("Sign message", async () => {
        const signedMessage1 = await bitcoinWallet.signMessage(TESTING_MESSAGE_1, TESTNET)
        console.log("Signed message 1: ", signedMessage1)
        assert(bitcoinMessage.verify(TESTING_MESSAGE_1, bitcoinWallet.address, signedMessage1.signedMessage), "Should verify message 1")

        const signedMessage2 = await bitcoinWallet.signMessage(TESTING_MESSAGE_2, TESTNET)
        console.log("Signed message 2: ", signedMessage2)
        assert(bitcoinMessage.verify(TESTING_MESSAGE_2, bitcoinWallet.address, signedMessage2.signedMessage), "Should verify message 2")

        const signedMessage3 = await bitcoinWallet.signMessage(TESTING_MESSAGE_3, TESTNET)
        console.log("Signed message 3: ", signedMessage3)
        assert(bitcoinMessage.verify(TESTING_MESSAGE_3, bitcoinWallet.address, signedMessage3.signedMessage), "Should verify message 3")
    })

    it("Get fees", async () => {
        const { transactionFees } = await bitcoinWallet.getFee(BTC_TXN_PARAM.connectionUrl);
        console.log("transactionFees ", transactionFees)
    })

    it("Sign Transaction", async () => {
        const { signedTransaction } = await bitcoinWallet.signTransaction(BTC_TXN_PARAM.transaction, BTC_TXN_PARAM.connectionUrl);
        console.log("signedTransaction ", signedTransaction)

        // const sendTransaction = await bitcoinWallet.sendTransaction(signedTransaction, BTC_TXN_PARAM.connectionUrl)
        // console.log("sendTransaction ", sendTransaction)
    })

})