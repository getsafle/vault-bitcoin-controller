const bitcoinjs = require('bitcoinjs-lib')

function generateAddress(bip32ExtendedKey, network, index) {

    let wallet = bip32ExtendedKey.derive(index);

    const hasPrivkey = !wallet.isNeutered();
    let privkey
    if (hasPrivkey) {
        privkey = wallet.toWIF();
    }
    const pubkey = wallet.publicKey.toString('hex');

    const { address } = bitcoinjs.payments.p2wpkh({ network, pubkey: wallet.publicKey })
    return {
        wallet, address, pubkey, privkey
    }
}

module.exports = generateAddress