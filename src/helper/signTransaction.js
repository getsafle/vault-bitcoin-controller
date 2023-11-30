const bitcore = require("bitcore-lib")

const {getFeeAndInput} = require('./calculateFeeAndInput')

async function signTransaction(from, to, amountToSend, URL, privateKey, satPerByte, headers) {

    const transaction = new bitcore.Transaction();

    const { totalAmountAvailable, inputs, fee } = await getFeeAndInput(URL, satPerByte, headers)

    if (totalAmountAvailable - amountToSend - fee < 0) {
        throw new Error("Balance is too low for this transaction");
    }

    //Set transaction input
    transaction.from(inputs);

    // set the recieving address and the amount to send
    transaction.to(to, Math.floor(amountToSend));

    // Set change address - Address to receive the left over funds after transfer
    transaction.change(from);

    //manually set transaction fees: 20 satoshis per byte
    transaction.fee(fee);

    // Sign transaction with your private key
    transaction.sign(privateKey);

    // serialize Transactions
    const serializedTransaction = transaction.serialize();

    return serializedTransaction;

}

module.exports = signTransaction