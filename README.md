# bitcoin-controller

## Install

`npm install --save @getsafle/vault-bitcoin-controller`

## Initialize the Bitcoin Controller class

```
const controller = require('@getsafle/vault-bitcoin-controller');

const bitcoinController = new controller({
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

bitcoinTx: {from, to, amount}
```

### Sign a message

```
const signedMsg = await bitcoinController.signMessage(msgString, address);
```

### Get fees

```
const fees = await bitcoinController.getFee(address);
```
