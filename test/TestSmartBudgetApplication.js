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
contract('SmartBudget:ApplicationTests', function(accounts) {
  it("should allow root to apply as candidate for subproject", function() {
    var contract;
    var root_acc = accounts[0];
    var child_acc = accounts[1];

    var tenderLockTime = 1000; // in seconds or unix timestamp
    var tenderLockType = 1; // 0 = absolute, 1 = relative
    var deliveryLockTime = 2000; // in seconds or unix timestamp
    var deliveryLockType = 1; // 0 = absolute, 1 = relative
    var initStake = web3.toWei(0.001, 'ether');
    var parentId = 0;
    var childId = 1;
    var candidateId = 0;
    var candidateName = "Root as candidate";
    var candidateStake = web3.toWei(0.0005, 'ether'); // in ether
    return SmartBudget.new(tenderLockTime, 
                          tenderLockType, 
                          deliveryLockTime, 
                          deliveryLockType, 
                          "SBTest", 
                          {from: root_acc, value: initStake}).then(function(instance) {
        contract = instance;
        console.log("       Adding new child node to root");
        return contract.addNode("First node", parentId);
      }).then( function(result) {
        console.log("       Applying for child node using child_acc");
        return contract.applyForNode(childId, candidateName, candidateStake, {from: root_acc});
      }).then( function(result) {
        return contract.getCandidateWeb(candidateId);
      }).then( function(candAttrs) {
        // string name, uint stake, address addr
        assert.equal(candAttrs[0], candidateName, "Candidate name should be " +  candidateName + " !");
        assert.equal(candAttrs[1], candidateStake, "The candidate stake should be set correctly!");
        assert.equal(candAttrs[2], root_acc, "The candidate address should be root!");
    });
  });

  it("should not allow applications with invalid (too high) stakes", function() {
    var contract;
    var root_acc = accounts[0];
    var child_acc = accounts[1];

    var tenderLockTime = 1000; // in seconds or unix timestamp
    var tenderLockType = 1; // 0 = absolute, 1 = relative
    var deliveryLockTime = 2000; // in seconds or unix timestamp
    var deliveryLockType = 1; // 0 = absolute, 1 = relative
    var initStake = web3.toWei(0.001, 'ether');
    var parentId = 0;
    var childId = 1;
    var candidateId = 0;
    var candidateName = "first candidate";
    var candidateStake = web3.toWei(0.05, 'ether'); // This is more than the total stake in the project
    return SmartBudget.new(tenderLockTime, 
                          tenderLockType, 
                          deliveryLockTime, 
                          deliveryLockType, 
                          "SBTest", 
                          {from: root_acc, value: initStake}).then(function(instance) {
        contract = instance;
        console.log("       Adding new child node to root");
        return contract.addNode("First node", parentId);
      }).then( function(result) {
        console.log("       Trying to apply for child node with too high stake");
        return expect(
          contract.applyForNode(childId, candidateName, candidateStake, {from: child_acc})
        ).be.rejectedWith('VM Exception while processing transaction');
    });
  });

  it("should not allow applications after the TENDER period", function() {
    var contract;
    var root_acc = accounts[0];
    var child_acc = accounts[1];

    var tenderLockTime = 1; // in seconds or unix timestamp
    var tenderLockType = 1; // 0 = absolute, 1 = relative
    var deliveryLockTime = 2000; // in seconds or unix timestamp
    var deliveryLockType = 1; // 0 = absolute, 1 = relative
    var initStake = web3.toWei(0.001, 'ether');
    var parentId = 0;
    var childId = 1;
    var candidateId = 0;
    var candidateName = "Root as candidate";
    var candidateStake = web3.toWei(0.0005, 'ether'); // in ether
    return SmartBudget.new(tenderLockTime, 
                          tenderLockType, 
                          deliveryLockTime, 
                          deliveryLockType, 
                          "SBTest", 
                          {from: root_acc, value: initStake}).then(function(instance) {
        contract = instance;
        console.log("       Adding new child node to root");
        return contract.addNode("First node", parentId);
      }).then( function(result) {
        sleep(2);
        console.log("       Trying to apply for child node after the TENDER period");
        return expect(
          contract.applyForNode(childId, candidateName, candidateStake, {from: child_acc})
        ).be.rejectedWith('VM Exception while processing transaction');
    });
  });

  it("should not allow applications to APPROVED nodes", function() {
    var contract;
    var root_acc = accounts[0];
    var child_acc = accounts[1];

    var tenderLockTime = 1000; // in seconds or unix timestamp
    var tenderLockType = 1; // 0 = absolute, 1 = relative
    var deliveryLockTime = 2000; // in seconds or unix timestamp
    var deliveryLockType = 1; // 0 = absolute, 1 = relative
    var initStake = web3.toWei(0.001, 'ether');
    var parentId = 0;
    var childId = 1;
    var candidateId = 0;
    var candidateName = "Root as candidate";
    var candidateStake = web3.toWei(0.0005, 'ether'); // in ether
    var anotherStake = web3.toWei(0.0001, 'ether'); // in ether
    return SmartBudget.new(tenderLockTime, 
                          tenderLockType, 
                          deliveryLockTime, 
                          deliveryLockType, 
                          "SBTest", 
                          {from: root_acc, value: initStake}).then(function(instance) {
        contract = instance;
        console.log("       Adding new child node to root");
        return contract.addNode("First node", parentId);
      }).then( function(result) {
        console.log("       Applying for child node using child_acc");
        return contract.applyForNode(childId, candidateName, candidateStake, {from: child_acc});
      }).then( function(result) {
        console.log("       Approving child node candidate using root_acc");
        return contract.approveNode(childId, candidateId, {from: root_acc});
      }).then( function(result) {
        console.log("       Trying to apply for an already approved node");
        return expect(
          contract.applyForNode(childId, "Another candidate", anotherStake, {from: root_acc})
        ).be.rejectedWith('VM Exception while processing transaction');
    });
  });
});
