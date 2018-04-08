var SmartBudget = artifacts.require("./SmartBudget.sol");

module.exports = function(deployer) {
  // deploy a contract with 10000000000 tender seconds and 10000000000000 delivery seconds
  deployer.deploy(SmartBudget, 10000000000, 1, 10000000000000, 1, "SmartBudgetTest", {value: web3.toWei(1.0, 'ether')});
};
