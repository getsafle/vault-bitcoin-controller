var assert = require('assert');
const bitcoinMessage = require('bitcoinjs-message')
const { KeyringController: Bitcoin, getBalance } = require('../src/index')
const {
    HD_WALLET_12_MNEMONIC,
    HD_WALLET_12_MNEMONIC_TEST_OTHER,
    EXTERNAL_ACCOUNT_PRIVATE_KEY,
    EXTERNAL_ACCOUNT_ADDRESS,
    EXTERNAL_ACCOUNT_PRIVATE_KEY_MAINNET,
    EXTERNAL_ACCOUNT_ADDRESS_MAINNET,
    EXTERNAL_ACCOUNT_WRONG_PRIVATE_KEY_1,
    EXTERNAL_ACCOUNT_WRONG_PRIVATE_KEY_2,
    EXTERNAL_ACCOUNT_WRONG_PRIVATE_KEY_3,
    EXTERNAL_ACCOUNT_WRONG_PRIVATE_KEY_4,
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
    to: BTC_RECEIVER,
    amount: BTC_AMOUNT,
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
        BTC_TXN_PARAM['from'] = acc[0]
        const { signedTransaction } = await bitcoinWallet.signTransaction(BTC_TXN_PARAM);
        console.log("signedTransaction ", signedTransaction)
    })

    it("Should import correct account ", async () => {
        if (opts.network === MAINNET) {
            const address = await bitcoinWallet.importWallet(EXTERNAL_ACCOUNT_PRIVATE_KEY_MAINNET)
            assert(address.toLowerCase() === EXTERNAL_ACCOUNT_ADDRESS_MAINNET.toLowerCase(), "Wrong address")
        } else {
            const address = await bitcoinWallet.importWallet(EXTERNAL_ACCOUNT_PRIVATE_KEY)
            assert(address.toLowerCase() === EXTERNAL_ACCOUNT_ADDRESS.toLowerCase(), "Wrong address")
        }
        assert(bitcoinWallet.importedWallets.length === 1, "Should have 1 imported wallet")
    })

    it("Should get balance of the address ", async () => {
        const acc = await bitcoinWallet.getAccounts()
        const balance = await getBalance(acc[0], opts.network)
        console.log("acc ", acc)
        console.log("balance ", balance)
    })

})