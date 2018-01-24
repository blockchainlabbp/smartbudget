//var SmartBudget = artifacts.require("./SmartBudget.sol");
var DataStructure = artifacts.require("./DataStructure.sol");

module.exports = function(deployer) {
  //deployer.deploy(SmartBudget);
  deployer.deploy(DataStructure);
};
