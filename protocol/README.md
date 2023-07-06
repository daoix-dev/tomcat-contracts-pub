# Tomcat Finance Contracts

## Contributing

NB: Tomcat uses both Foundry and Hardhat, as they both have useful features depending on use case (eg speed of tests vs typescript ecosystem)

The general rule of thumb is:
- Write tests in solidity (forge)
- Write deploy scripts in typescript

## Getting Started

```bash
# Ensure submodules are pulled for Foundry (forge-std)
git submodule update --init --recursive

# Pick the right node version (v18) from .nvmrc
nvm use

# Install typescript dependencies, including upstream soliditiy libraries - eg @openzeppelin/contracts
yarn

# Either:
# a/ Use hardhat to compile and create typechain bindings
yarn compile

# OR
# /b Build with forge
forge build
```

### Test

Written in solidity (far quicker test runtime)

```bash
forge test
```

### Code Coverage

```bash
yarn forge-coverage-html
```

Report now available in `./report/index.html`

### Slither Static Analysis

Triage mode is used to compare vs the last run. To update the db:

```bash
yarn slither
```

And for each item, accept the finding (`0` or `1` or ... or `All`)

## Deploying

Create a .env in this dir

```bash
# Sign up at https://etherscan.io/
ETHERSCAN_API_KEY=XXX

# Sign up at https://www.alchemy.com/
# (or infura)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/XXX

# Only add in when required, remove afterwards. 
SEPOLIA_ADDRESS_PRIVATE_KEY=XXX
```

Run deploy scripts as required, eg:

```bash
npx hardhat run --network sepolia scripts/deploys/sepolia/02-tcMav.ts
```

This will create a file for the deployment args which can be verified (the deploy log will tell you)

```bash
yarn hardhat verify --network sepolia 0xc112C191A1aa51781C8D540f87B05ee3bbF18336 --constructor-args scripts/deploys/sepolia/deploymentArgs/0xc112C191A1aa51781C8D540f87B05ee3bbF18336.js
```
