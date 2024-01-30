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

### 2.0.2 (2023-11-18)

##### Implement get satoshi per byte functionality

- Standardize getFees() to provide transaction fee in sathoshi and transaction size
- Added HD PATH for testnet
- Updated tests to add assertions
- Added constants for base URLs
- Updated node version in CI
- Updated raw transaction paramaters, amount to be accepted in satoshi
- Added badges
- Updated license in package json

### 2.0.3 (2023-12-04)

##### GetFees() update

- Added await for the async call to get transactionSize and updated tests

### 2.0.4 (2024-01-09)

- Updated Sochain api key

### 2.0.5 (2024-01-23)

- Replaced blockcyper api with sochain api to fetch fees in satoshi
- Updated sign transaction to use bitcoinjs-lib

### 2.0.6 (2024-01-23)

- Added proxy URL to prevent CORS issue

### 2.0.7 (2024-01-30)

- Added generic network parameter in sign transaction