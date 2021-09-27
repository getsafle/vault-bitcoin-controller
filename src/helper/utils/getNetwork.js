const bitcoinjs = require('bitcoinjs-lib')
const { bitcoin_network: { MAINNET, TESTNET } } = require('../../config/index')

function getActiveNetwork(_network){
    return _network === TESTNET.NETWORK ? bitcoinjs.networks.testnet : bitcoinjs.networks.bitcoin 
}

module.exports = getActiveNetwork