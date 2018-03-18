var SmartBudget = artifacts.require("./SmartBudget.sol");

module.exports = function(deployer) {
  // deploy a contract with 100 tender seconds and 1000 delivery seconds
  deployer.deploy(SmartBudget, 100, 1, 1000, 1, {value: web3.toWei(1.0, 'ether')});
};
