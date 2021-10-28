const axios = require('axios')
const { SATOSHI } = require("../config/index")

async function getFeeAndInput(URL) {

    let fee = 0;
    let inputCount = 0;
    let outputCount = 2;
    const utxos = await axios.get(URL);

    let totalAmountAvailable = 0;

    let inputs = [];
    utxos.data.data.txs.forEach(async (element) => {
        let utxo = {};
        utxo.satoshis = Math.floor(Number(element.value) * SATOSHI);
        utxo.script = element.script_hex;
        utxo.address = utxos.data.data.address;
        utxo.txId = element.txid;
        utxo.outputIndex = element.output_no;
        totalAmountAvailable += utxo.satoshis;
        inputCount += 1;
        inputs.push(utxo);
    });

    transactionSize = inputCount * 180 + outputCount * 34 + 10 - inputCount;
    // the fees assuming we want to pay 20 satoshis per byte

    fee = transactionSize * 20
    return {totalAmountAvailable, inputs, fee}

}

module.exports = getFeeAndInput