const bitcoinjs = require('bitcoinjs-lib')

function getAddressFromPk(privateKeyHex, network, index) {
    const ec_pair = bitcoinjs.ECPair.fromWIF(privateKeyHex, network)
    const { address } = bitcoinjs.payments.p2pkh({ network, pubkey: ec_pair.publicKey })
    return address
}

module.exports = getAddressFromPk