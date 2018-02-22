var SmartBudget = artifacts.require("./SmartBudget.sol");
var MapBasedDataStructure = artifacts.require("./MapBasedDataStructure.sol");

module.exports = function(deployer) {
  deployer.deploy(MapBasedDataStructure);
  deployer.link(MapBasedDataStructure, SmartBudget);
  // deploy a contract that will be locked for 1000 seconds after it has made it into the blockchain
  deployer.deploy(SmartBudget, 1000, 1, {value: web3.toWei(1.0, 'ether')});
};
