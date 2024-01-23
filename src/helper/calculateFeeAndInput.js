const axios = require('axios')
var sb = require("satoshi-bitcoin");

async function getTransactionSize(URL, headers){
    
    let inputCount = 0;
    let outputCount = 2;

    const utxos = await axios({
        url : `${URL}`,
        method: 'GET',
        headers: headers
    });
    
    let totalAmountAvailable = 0;

    let inputs = [];
    utxos.data.data.outputs.forEach(async (element) => {
        let utxo = {};
        utxo.value = sb.toSatoshi(parseFloat(element.value));
        utxo.scriptPubKey = element.script;
        utxo.txid = element.hash;
        utxo.vout = element.index;
        totalAmountAvailable += utxo.value;
        inputCount += 1;
        inputs.push(utxo);
    });

    let transactionSize = inputCount * 180 + outputCount * 34 + 10 - inputCount;
    return { transactionSize, totalAmountAvailable, inputs}
}

async function getFeeAndInput(URL, satPerByte, headers) {
    let { transactionSize, totalAmountAvailable, inputs} = await getTransactionSize(URL, headers)
    let fee = 0;
    // the fees assuming we want to pay 20 satoshis per byte
    fee = transactionSize * satPerByte
    return { totalAmountAvailable, inputs, fee, transactionSize}

}

module.exports = {
    getFeeAndInput,
    getTransactionSize
}