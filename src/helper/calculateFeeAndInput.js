const axios = require('axios')
var sb = require("satoshi-bitcoin");
const { SATOSHI } = require("../config/index")

async function getFeeAndInput(URL, satPerByte, headers) {

    let fee = 0;
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
        utxo.satoshis = sb.toSatoshi(parseFloat(element.value));
        utxo.script = element.script;
        utxo.address = element.address;
        utxo.txId = element.hash;
        utxo.outputIndex = element.index;
        totalAmountAvailable += utxo.satoshis;
        inputCount += 1;
        inputs.push(utxo);
    });

    transactionSize = inputCount * 180 + outputCount * 34 + 10 - inputCount;
    // the fees assuming we want to pay 20 satoshis per byte
    fee = transactionSize * satPerByte
    return { totalAmountAvailable, inputs, fee }

}

module.exports = getFeeAndInput