var ConvertLib = artifacts.require("./ConvertLib.sol");
var MetaCoin = artifacts.require("./MetaCoin.sol");
var SmartBudget = artifacts.require("./SmartBudget.sol");

module.exports = function(deployer) {
  deployer.deploy(ConvertLib);
  deployer.link(ConvertLib, MetaCoin);
  deployer.deploy(MetaCoin);
  //initLock timestamp = 2019. January 21., Monday 17:33:13, 30 ether
  deployer.deploy(SmartBudget, 15480919933, {value: web3.toWei(30.0, 'ether')});
};
