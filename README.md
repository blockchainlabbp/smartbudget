# SmartBudget - the smart budget manager dapp

Ethereum smart contract based project budget managment app. Built by blockchain enthusiast for blockchain enthusiast.

## Table of Contents

- [Installation](#installation)
  - [Metamask](#metamask)
- [Usage](#usage)
- [Contribute](#contribute)
  - [Requirements](#requirements)
  - [Project setup](#project-setup)
  - [Development workflow](#development-workflow)
  - [Tests](#tests)
  - [Documentation](#documentation)
- [License](#license)

## Installation

### MetaMask

You need to have the [MetaMask](https://metamask.io/) extension installed in your browser to interact with the website.

> Tip: use the Ropsten network to try the website with test ether. Get some test ether [here](https://faucet.ropsten.be/).

## Usage

A beta version of the project is live at http://teszt.tomorgraphic.com/.

## Contribute

### Requirements

If you want to contribute to the project you need to install the following:

- Install NodeJS and npm (Node Package Manager): https://nodejs.org/en/

- Install [Ganache cli](https://github.com/trufflesuite/ganache-cli) to have a local blockchain for development.

Optional:

- Install `solc` binaries (https://github.com/ethereum/solidity/releases) and add it to your PATH (this is only needed for [documentation generation](#documentation))

### Project setup

- Initial setup

Execute the `build.cmd` script in the root of the repository. This will install Truffle, the required packages and build the sources for the entire site.

- Clean and rebuild workspace

Execute `clean.cmd`, then `build.cmd`. Might be needed if project dependencies have changed since your last build

- Incremental build

In a typical development scenario, you only need to call `truffle.cmd compile` to compile the smart contract sources and `npm run dev` to run the webpack development server.

### Development workflow
The typical development workflow follows consists of executing the following steps in cycles until you had enough...

1. Start `ganache-cli` to have a local blockchain running on your dev machine. To clear you blockchain, just restart ganache.
2. Run `truffle compile` - this compiles for you the EVM bytecode of the smart contract that can be uploaded to the blockchain, and the ABI that is needed by the dapp to interact with the smart contract. Run this each time you update the smart contracts.
3. `npm run dev` - Run webpack dev server. Just edit any sorce files you wish, the webpack dev server will reload them on the fly!

### Tests
* Full test suite: `truffle test`
* Javascript tests only: `./node_modules/mocha/bin/mocha --require babel-register test/*.js`

### Ropsten test network
Metamask seed words: `man garbage awesome trash juice hollow genre service verify amount awake shy`

### Notes
Do not remove `package-lock.json` from source control, it is intended to be committed: https://github.com/npm/npm/blob/latest/doc/files/package-lock.json.md

### Documentation

The documentation of the solidity files can be found here:

[SmartBudget](docs/contracts.md/SmartBudget.md)

We're using [solmd](https://github.com/dpilch/solmd) to generate markdown documentation for our solidity files.
Currently the documentation generation has to be kicked off manually, no pipeline set up yet.
To update the documentation of the Solidity files:

1. Add comments to the Solidity files following the Ethereum NatSpec format: https://github.com/ethereum/wiki/wiki/Ethereum-Natural-Specification-Format
1. Call `npm run docs`
1. Add the generated `.md` files to the repository
1. For new Solidity files, add new link to the Solidity docs section below

