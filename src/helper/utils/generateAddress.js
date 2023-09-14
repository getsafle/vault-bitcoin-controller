const bitcoinjs = require('bitcoinjs-lib')

function generateAddress(bip32ExtendedKey, network, index) {

    let wallet = "NA";
    wallet = bip32ExtendedKey.derive(index);

    const hasPrivkey = !wallet.isNeutered();
    let privkey = "NA";
    if (hasPrivkey) {
        privkey = wallet.toWIF();
    }
    const pubkey = wallet.publicKey.toString('hex');

    const { address } = bitcoinjs.payments.p2pkh({ network, pubkey: wallet.publicKey })
    return {
        wallet, address, pubkey, privkey
        // wallet, address: 'mw7XFVR4BtLXoGTwGYWPHD2cB4UxPhMj59', pubkey, privkey
    }
}

module.exports = generateAddress