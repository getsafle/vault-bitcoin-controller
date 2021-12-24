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

const opts = {
    mnemonic: HD_WALLET_12_MNEMONIC,
    network: TESTNET
}

describe('Initialize wallet ', () => {
    const bitcoinWallet = new Bitcoin(opts)

    it("Should generate new address ", async () => {
        const wallet = await bitcoinWallet.addAccount()
        console.log("wallet, ", wallet)
        const wallet2 = await bitcoinWallet.addAccount()
        console.log("wallet2, ", wallet2)
    })

    it("Should get accounts", async () => {
        const acc = await bitcoinWallet.getAccounts()
        console.log("acc ", acc)
        assert(acc.length === 2, "Should have 2 addresses")
    })

    it("Should get privateKey ", async () => {
        const acc = await bitcoinWallet.getAccounts()
        const privateKey = await bitcoinWallet.exportPrivateKey(acc[0])
        console.log("privateKey, ", privateKey)
    })

    it("Sign message", async () => {
        const acc = await bitcoinWallet.getAccounts()

        const signedMessage1 = await bitcoinWallet.signMessage(TESTING_MESSAGE_1, acc[0])
        console.log("Signed message 1: ", signedMessage1)
        assert(bitcoinMessage.verify(TESTING_MESSAGE_1, acc[0], signedMessage1.signedMessage), "Should verify message 1")

        const signedMessage2 = await bitcoinWallet.signMessage(TESTING_MESSAGE_2, acc[0])
        console.log("Signed message 2: ", signedMessage2)
        assert(bitcoinMessage.verify(TESTING_MESSAGE_2, acc[0], signedMessage2.signedMessage), "Should verify message 2")

        const signedMessage3 = await bitcoinWallet.signMessage(TESTING_MESSAGE_3, acc[0])
        console.log("Signed message 3: ", signedMessage3)
        assert(bitcoinMessage.verify(TESTING_MESSAGE_3, acc[0], signedMessage3.signedMessage), "Should verify message 3")
    })

    it("Get fees", async () => {
        const acc = await bitcoinWallet.getAccounts()
        const { transactionFees } = await bitcoinWallet.getFee(acc[0]);
        console.log("transactionFees ", transactionFees)
    })

    it("Sign Transaction", async () => {
        const acc = await bitcoinWallet.getAccounts()
        BTC_TXN_PARAM.transaction.data['from'] = acc[0]
        const { signedTransaction } = await bitcoinWallet.signTransaction(BTC_TXN_PARAM.transaction);
        console.log("signedTransaction ", signedTransaction)

        const sendTransaction = await bitcoinWallet.sendTransaction(signedTransaction)
        console.log("sendTransaction ", sendTransaction)
    })

})