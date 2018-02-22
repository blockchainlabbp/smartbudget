# SmartBudget - the smart budget manager dapp
* Based on https://github.com/truffle-box/webpack-box
* Truffle docs: http://truffleframework.com/docs/
* Webpack guides: https://webpack.js.org/guides/
* FancyTree docs: https://github.com/mar10/fancytree/wiki
* ES6 modules: https://developer.ibm.com/node/2015/12/01/an-introduction-to-javascript-es6-modules/

## Setting up the development environment
1. Install NodeJS and npm (Node Package Manager): https://nodejs.org/en/
1. Install `solc` binaries (https://github.com/ethereum/solidity/releases) and add it to your PATH (this is only needed for documentation generation)
1. `npm install -g truffle` - Install Truffle globally. It means `truffle` command will be available throughout the system
1. `git clone https://gitlab.com/BlokklancMuhely/MuhelyMunkak/smartbudget.git`  - Clone the git repository
1. `npm install` - within the `smartbudget` folder. This will download all dependencies defined in `package.json`. These node modules are installed into `node_modules`, therefore only available within the project.

### Setting up Metamask
Metamask is a web3.js provider and Ethereum wallet as a browser extension. It is essential for interacting with Ethereum smart contracts from the browser.
1. Read 'Interacting with the dapp in a browser' section at http://truffleframework.com/tutorials/pet-shop
2. If Metamask transactions fail because of invalid nonce, then change the 'network id' in Ganache settings. It usually happens when Ganache is restarted and a totally fresh blockchain is generated because Metamask does not update the fresh state from Ganache.

## Running project
(!) Make sure to start `Ganache`, `truffle develop` or `geth` on the port defined in `truffle.js` before running `truffle migrate`

1. `truffle compile` - Compile `.sol` files into `build/contracts`. This generates the `.json` files that represent the ABI to be used in javascript code
2. `truffle migrate` - Deploy the contracts to Ethereum node
3. `npm run dev` - Run webpack dev server

## Running tests
* Full test: `truffle test`
* Frontend test: `./node_modules/mocha/bin/mocha --require babel-register test/*.js`

## Notes
Do not remove `package-lock.json` from source control, it is intended to be committed: https://github.com/npm/npm/blob/latest/doc/files/package-lock.json.md

## Smart Contract documentation
We're using [solmd](https://github.com/dpilch/solmd) to generate markdown documentation for our solidity files.
Currently the documentation generation has to be kicked off manually, no pipeline set up yet.
To update the documentation of the Solidity files:

1. Add comments to the Solidity files following the Ethereum NatSpec format: https://github.com/ethereum/wiki/wiki/Ethereum-Natural-Specification-Format
1. Call `npm run docs`
1. Add the generated `.md` files to the repository
1. For new Solidity files, add new link to the Solidity docs section below

### Solidity Docs
[SmartBudget](docs/contracts.md/SmartBudget.md)
[TreeDataStructure](docs/contracts.md/TreeDataStructure.md)
