const bitcoin = require("bitcoinjs-lib")

const {getFeeAndInput} = require('./calculateFeeAndInput')

async function signTransaction(from, to, amountToSend, URL, privateKey, satPerByte, headers, network) {
    
    const psbt = new bitcoin.Psbt({ network: network }) 

    const { totalAmountAvailable, inputs, fee } = await getFeeAndInput(URL, satPerByte, headers)

    if (totalAmountAvailable - amountToSend - fee < 0) {
        throw new Error("Balance is too low for this transaction");
    }

    for (const unspentOutput of inputs) {
        psbt.addInput({
            hash: unspentOutput.txid,
            index: unspentOutput.vout,
            witnessUtxo: {
                script: Buffer.from(unspentOutput.scriptPubKey, 'hex'),
                value: unspentOutput.value // value in satoshi
            },
        })
    }

    psbt.addOutput({address: to, value: amountToSend});

    const change = totalAmountAvailable - amountToSend - fee
    psbt.addOutput({address: from, value: change});
    
    for (let i = 0; i < inputs.length; i++) {
        psbt.signInput(i, bitcoin.ECPair.fromWIF(privateKey, network))
    }

    const isValid = psbt.validateSignaturesOfAllInputs()

    if (isValid) {
        psbt.finalizeAllInputs()
        // signed transaction hex
        const transaction = psbt.extractTransaction()
        const signedTransaction = transaction.toHex()
        const transactionId = transaction.getId()

        return signedTransaction
    }
    
}


module.exports = signTransaction