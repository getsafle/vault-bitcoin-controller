# bitcoin-wallet-controller

This repository contains `BTCHdKeyring` class to create **Bitcoin wallet** from **Safle Vault**. The address type currently created is `p2phk`


## Usecase

We will be using `BTCHdKeyring` class to initialize the wallet and then utilize the provided functions to perform the required tasks. <br />
The class initialization is done in the following way.

```
const btcWallet = new BTCHdKeyring(`mnemonic`)
```

`mnemonic` is the BIP-39 key phrase to generate the wallet.

Once we initialize the class, we can utilize the provided functions.

The wallet have the following functions:

#### generateWallet()

This function is used to generate the Bitcoin wallet and set the 0th address as the default address. <br />
parameters: - <br />
```
wallet_object: BIP32 object
```
returns: `{wallet: wallet_object, address: string} // wallet address`

#### exportPrivateKey()

This function is used to export the private key for the generated address. <br />
**parameters:** - <br />
**returns:** `{privateKey: string} // address private key`

#### signTransaction(transaction: _TransactionObj_ , connectionUrl?: _string_ )

This function is used to sign a transaction off-chain and then send it to the network.<br /> Transactions type is as below:

1. BTC transfer:<br />
   Trasaction to transfer BTC from one wallet/address to another.<br />The transaction object is of the following type:
```
TransactionObj: {
    data: {
        to, // destination address
        amount, // amount
    }
}
```

**parameters:**
```
name: transaction,
type: TransactionObj, // refer to the above trancationObj types.

name: connectionUrl, // BTC network URL
type: string,
default: MAINNET (undefined)
optional
```
**returns:** `{signedTransaction: string} hex_string of signed raw transaction`

#### signMessage(message: _string_, connectionUrl?: _string_)

This function is used to sign a message. <br />
**parameters:**
```
name: message
type: string

name: connectionUrl, // BTC network {TESTNET | MAINNET}
type: string,
default: MAINNET (undefined)
optional
```
**returns:** `{signedMessage: string} // signed message hex string`

#### getAccounts()

This function is used to get the wallet address. <br />

**parameters:** - <br />
**returns:** `{address: string} // wallet address`

#### sendTransaction(rawTransaction: _Buffer_ | _UInt8Array_ , connectionUrl?: _string_)

This function is used send the signed transaction onto the chain. <br />
**parameters:**
```
name: rawTransaction, // signed raw transaction (got from signedTransaction())
type: Buffer | UInt8Array

name: connectionUrl, // BTC network {TESTNET | MAINNET}
type: string,
default: MAINNET (undefined)
optional
```
**returns:** `{transactionDetails : Object} // transaction details with transaction hash`

#### getFee(connectionUrl?: _string_)

This function is used to get the transaction fees. <br />

**parameters:** - <br />
**returns:** `{transactionFees: integer} // transaction fees`

## Note

We are using `https://sochain.com` API to fetch and publish data on bitcoin network. 