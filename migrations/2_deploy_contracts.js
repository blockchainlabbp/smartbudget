<<<<<<< HEAD
//var SmartBudget = artifacts.require("./SmartBudget.sol");
var DataStructure = artifacts.require("./DataStructure.sol");

module.exports = function(deployer) {
  //deployer.deploy(SmartBudget);
  deployer.deploy(DataStructure);
=======
var ConvertLib = artifacts.require("./ConvertLib.sol");
var MetaCoin = artifacts.require("./MetaCoin.sol");
var SmartBudget = artifacts.require("./SmartBudget.sol");

module.exports = function(deployer) {
  deployer.deploy(ConvertLib);
  deployer.link(ConvertLib, MetaCoin);
  deployer.deploy(MetaCoin);
  // deploy a contract that will be locked for 1000 seconds after it has made it into the blockchain
  deployer.deploy(SmartBudget, 1000, 1, {value: web3.toWei(1.0, 'ether')});
>>>>>>> a1c84dbb0e3dd1cd136ab3f3a20875069c4f7231
};
