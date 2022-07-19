const bitcore = require("bitcore-lib")
const { SATOSHI, DEFAULT_SATOSHI_PER_BYTE } = require("../config/index")

const getFeeAndInput = require('./calculateFeeAndInput')

async function signTransaction(from, to, amountToSend, URL, privateKey, satPerByte = DEFAULT_SATOSHI_PER_BYTE) {

    const satoshiToSend = amountToSend * SATOSHI;

    const transaction = new bitcore.Transaction();

    const { totalAmountAvailable, inputs, fee } = await getFeeAndInput(URL, satPerByte)

    if (totalAmountAvailable - satoshiToSend - fee < 0) {
        throw new Error("Balance is too low for this transaction");
    }

    //Set transaction input
    transaction.from(inputs);

    // set the recieving address and the amount to send
    transaction.to(to, Math.floor(satoshiToSend));

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