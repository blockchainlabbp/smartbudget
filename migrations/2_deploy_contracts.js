var SmartBudget = artifacts.require("./SmartBudget.sol");

module.exports = function(deployer) {
  // deploy a contract that will be locked for 5 seconds after it has made it into the blockchain
  deployer.deploy(SmartBudget, 5, 1, {value: 1000000000000000000});
};
