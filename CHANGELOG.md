### 1.0.0 (2021-12-27)

##### Bitcoin Keyring Implementation

- Implemented Keyring functionality to enable account generation, export keys and signing methods

### 1.0.1 (2022-01-22)

##### Implement import wallet functionality

- Added importWallet() to import account using privateKey.

### 1.1.0 (2022-02-16)

##### Implement get balance functionality

- Added getBalance() to fetch the balance in BTC.

### 1.2.0 (2022-07-18)

##### Custom gas parameter added

- Added satPerByte to add custom gas parameter satoshi.

### 1.2.1 (2022-07-19)

##### Make custom gas parameter compulsory

- Changed satPerByte from optional to compulsory parameter.

### 1.2.2 (2022-09-06)

##### UTXO calculation fix

- UTXO.satoshi calculation fix.

### 1.2.3 (2022-09-16)

##### UTXO calculation fix

- UTXO.satoshi calculation and adding package `satoshi-bitcoin`.

### 2.0.0 (2023-09-25)

#####  Sochain api update for UTXO calculation
#####  Derivation path update for the P2WPKH standard addresses

### 2.0.1 (2023-10-04)

#####  Enabled message and transaction signing for imported accounts