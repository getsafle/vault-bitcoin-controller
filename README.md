# bitcoin-controller<code><a href="https://www.docker.com/" target="_blank"><img height="50" src="https://bitcoin.org/img/icons/logotop.svg?1700824099"></a></code>

[![npm version](https://badge.fury.io/js/@getsafle%2Fvault-bitcoin-controller.svg)](https://badge.fury.io/js/@getsafle%2Fvault-bitcoin-controller) <img alt="Static Badge" src="https://img.shields.io/badge/License-MIT-green">   [![Discussions][discussions-badge]][discussions-link]
 <img alt="Static Badge" src="https://img.shields.io/badge/bitcoin_controller-documentation-purple"> 



## Install

`npm install --save @getsafle/vault-bitcoin-controller`

## Initialize the Bitcoin Controller class

```
const { KeyringController, getBalance } = require('@getsafle/vault-bitcoin-controller');

const bitcoinController = new KeyringController({
    // 12 words mnemonic to create wallet
    mnemonic: string,
    // network - type of network [TESTNET|MAINNET]
    // default is MAINNET even if no network is passed
    network: string (TESTNET | MAINNET)
});
```

## Methods

### Generate Keyring with 1 account or add new account

```
const keyringState = await bitcoinController.addAccount();
```

### Export the private key of an address present in the keyring

```
const privateKey = await bitcoinController.exportPrivateKey(address);
```

### Get all accounts in the keyring

```
const privateKey = await bitcoinController.getAccounts();
```

### Sign a transaction

```
const signedTx = await bitcoinController.signTransaction(bitcoinTx);

bitcoinTx: {from, to, amount, satPerByt}
```

### Sign a message

```
const signedMsg = await bitcoinController.signMessage(msgString, address);
```

### Get fees

```
const fees = await bitcoinController.getFees(rawTransaction);
```

### Get balance

```
const balance = await getBalance(address, network); // if network !== TESTNET then it will fetch mainnet balance
```

[discussions-badge]: https://img.shields.io/badge/Code_Quality-passing-rgba
[discussions-link]: https://github.com/getsafle/vault-bitcoin-controller/actions