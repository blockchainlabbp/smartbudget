var SmartBudget = artifacts.require("./SmartBudget.sol");
var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;
var assert = chai.assert; 
// Some help on the available functions:
// https://github.com/trufflesuite/truffle-contract

function sleep(seconds) 
{
  var e = new Date().getTime() + (seconds * 1000);
  while (new Date().getTime() <= e) {}
}

// http://truffleframework.com/docs/getting_started/javascript-tests#use-contract-instead-of-describe-
contract('SmartBudget:ConstructorTests', function(accounts) {
  it("should have a root node after deployment", function() {
    var tree;
    var root_acc = accounts[0];
    SmartBudget.defaults({from: root_acc});

    var tenderLockTime = 1000; // in seconds or unix timestamp
    var tenderLockType = 1; // 0 = absolute, 1 = relative
    var deliveryLockTime = 2000; // in seconds or unix timestamp
    var deliveryLockType = 1; // 0 = absolute, 1 = relative
    var initStake = web3.toWei(0.001, 'ether');
    var rootDesc = "SBTest";
    var lastNodeId;
    return SmartBudget.new(tenderLockTime, 
                          tenderLockType, 
                          deliveryLockTime, 
                          deliveryLockType, 
                          rootDesc, 
                          {from: root_acc, value: initStake}).then(function(instance) {
        tree = instance;
        return tree.nodeCntr();
      }).then(function (nodeCntr) {
        lastNodeId = nodeCntr - 1;
        return tree.getNodesWeb(0, lastNodeId);
      }).then(function (nodesArray) {
        // (int[] _ids, uint[] _stakes, int[] _parentIds, address[] _addresses)
        assert.equal(nodesArray[0].length, 1, "Contract should have exatly one node after deployment!");
        var id = nodesArray[0][0];
        var stake = nodesArray[1][0].toNumber();  // Originally it is a BigInt, we need to convert it
        var parent = nodesArray[2][0];
        var address = nodesArray[3][0];
        assert.equal(id, 0, "Root id must be 0!");
        assert.equal(stake, initStake, "Root stake not set correctly!");
        assert.equal(parent, 0, "Root's parent must be itself (parent id = 0)!");
        assert.equal(address, root_acc, "Root address must be the first account in Ganache!");
    });
  });
  it("should be in TENDER state after deployment", function() {
    var contract;
    var root_acc = accounts[0];
    var child_acc = accounts[1];

    var tenderLockTime = 10000; // in seconds or unix timestamp
    var tenderLockType = 1; // 0 = absolute, 1 = relative
    var deliveryLockTime = 20000; // in seconds or unix timestamp
    var deliveryLockType = 1; // 0 = absolute, 1 = relative
    var rootDesc = "SBTest";
    var initStake = web3.toWei(0.001, 'ether');
    var lastNodeId;
    var expectedState = 2; // TENDER == 2
    return SmartBudget.new(tenderLockTime, 
                          tenderLockType, 
                          deliveryLockTime, 
                          deliveryLockType, 
                          rootDesc, 
                          {from: root_acc, value: initStake}).then(function(instance) {
        contract = instance;
        return  contract.getContractState();
      }).then( function(state) {
        assert.equal(state, expectedState, "After deployment, contract state should be TENDER (2)");
    });
  });
});
