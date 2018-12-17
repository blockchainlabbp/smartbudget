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
contract('SmartBudget:WithdrawalTests', function(accounts) {
    it("should allow child_acc to withdraw its stake after completion", function() {
      var contract;
      var root_acc = accounts[0];
      var child_acc = accounts[1];
  
      var tenderLockTime = 2; // in seconds or unix timestamp
      var tenderLockType = 1; // 0 = absolute, 1 = relative
      var deliveryLockTime = 4; // in seconds or unix timestamp
      var deliveryLockType = 1; // 0 = absolute, 1 = relative
      var initStake = web3.toWei(0.001, 'ether');
      var rootId = 0;
      var childId = 1;
      var candidateId = 0;
      var candidateName = "First candidate";
      var candidateStake = web3.toWei(0.0005, 'ether'); // in ether
      var payedState = 3;
      return SmartBudget.new(tenderLockTime, 
                            tenderLockType, 
                            deliveryLockTime, 
                            deliveryLockType, 
                            "SBTest", 
                            {from: root_acc, value: initStake}).then(function(instance) {
          contract = instance;
          console.log("       Adding new child node to root");
          return contract.addNode("First node", rootId, {from: root_acc});
        }).then( function(result) {
          console.log("       Applying for child node using child_acc");
          return contract.applyForNode(childId, candidateName, candidateStake, {from: child_acc});
        }).then( function(result) {
          console.log("       Approving child node candidate using root_acc");
          return contract.approveNode(childId, candidateId, {from: root_acc});
        }).then( function(result) {
          // Wait until DELIVERY
          console.log("       Waiting until delivery period...");
          sleep(2);
          console.log("       Mark node complete using root");
          return contract.markNodeComplete(childId, {from: root_acc});
        }).then(function (result) {
          // Withdraw
          // Wait until DELIVERY
          console.log("       Waiting until finished state...");
          sleep(2);
          console.log("       Withdraw stake using child_acc");
          return contract.withdraw(childId, {from: child_acc});
        }).then(function (result) {
          // Check if state has been flipped
          return contract.getNodeVars(childId);
        }).then( function(attributes) {
          // uint stake, NodeState state, uint[] cands, uint[] childs
          var state = attributes[1].toNumber();
          assert.equal(state, payedState, "Node owner should be able to withdraw their stake after completion!");
        });
    });
    it("should not allow withdrawal in TENDER period", function() {
      var contract;
      var root_acc = accounts[0];
      var child_acc = accounts[1];
  
      var tenderLockTime = 2000; // in seconds or unix timestamp
      var tenderLockType = 1; // 0 = absolute, 1 = relative
      var deliveryLockTime = 4000; // in seconds or unix timestamp
      var deliveryLockType = 1; // 0 = absolute, 1 = relative
      var initStake = web3.toWei(0.001, 'ether');
      var rootId = 0;
      var childId = 1;
      var candidateId = 0;
      var candidateName = "First candidate";
      var candidateStake = web3.toWei(0.0005, 'ether'); // in ether
      var payedState = 3;
      return SmartBudget.new(tenderLockTime, 
                            tenderLockType, 
                            deliveryLockTime, 
                            deliveryLockType, 
                            "SBTest", 
                            {from: root_acc, value: initStake}).then(function(instance) {
          contract = instance;
          console.log("       Adding new child node to root");
          return contract.addNode("First node", rootId, {from: root_acc});
        }).then( function(result) {
          console.log("       Applying for child node using child_acc");
          return contract.applyForNode(childId, candidateName, candidateStake, {from: child_acc});
        }).then( function(result) {
          console.log("       Approving child node candidate using root_acc");
          return contract.approveNode(childId, candidateId, {from: root_acc});
        }).then( function(result) {
          console.log("       Attempting withdrawal in TENDER period using child_acc");
          return expect(
            contract.withdraw(childId, {from: child_acc})
          ).be.rejectedWith('VM Exception while processing transaction');
        });
    });
    it("should not allow child_acc to withdraw its stake if root did not mark it as completed", function() {
      var contract;
      var root_acc = accounts[0];
      var child_acc = accounts[1];
  
      var tenderLockTime = 2; // in seconds or unix timestamp
      var tenderLockType = 1; // 0 = absolute, 1 = relative
      var deliveryLockTime = 3; // in seconds or unix timestamp
      var deliveryLockType = 1; // 0 = absolute, 1 = relative
      var initStake = web3.toWei(0.001, 'ether');
      var rootId = 0;
      var childId = 1;
      var candidateId = 0;
      var candidateName = "First candidate";
      var candidateStake = web3.toWei(0.0005, 'ether'); // in ether
      var payedState = 3;
      return SmartBudget.new(tenderLockTime, 
                            tenderLockType, 
                            deliveryLockTime, 
                            deliveryLockType, 
                            "SBTest", 
                            {from: root_acc, value: initStake}).then(function(instance) {
          contract = instance;
          console.log("       Adding new child node to root");
          return contract.addNode("First node", rootId, {from: root_acc});
        }).then( function(result) {
          console.log("       Applying for child node using child_acc");
          return contract.applyForNode(childId, candidateName, candidateStake, {from: child_acc});
        }).then( function(result) {
          console.log("       Approving child node candidate using root_acc");
          return contract.approveNode(childId, candidateId, {from: root_acc});
        }).then( function(result) {
          console.log("       Waiting until finished state...");
          sleep(3);
          console.log("       Attempting withdrawal without root marking the node complete");
          return expect(
            contract.withdraw(childId, {from: child_acc})
          ).be.rejectedWith('VM Exception while processing transaction');
        });
    });
    it("should allow root to withdraw the stake allocated for child if he didn't mark the node as completed", function() {
      var contract;
      var root_acc = accounts[0];
      var child_acc = accounts[1];
  
      var tenderLockTime = 2; // in seconds or unix timestamp
      var tenderLockType = 1; // 0 = absolute, 1 = relative
      var deliveryLockTime = 4; // in seconds or unix timestamp
      var deliveryLockType = 1; // 0 = absolute, 1 = relative
      var initStake = web3.toWei(0.001, 'ether');
      var rootId = 0;
      var childId = 1;
      var candidateId = 0;
      var candidateName = "First candidate";
      var candidateStake = web3.toWei(0.0005, 'ether'); // in ether
      var payedState = 3;
      return SmartBudget.new(tenderLockTime, 
                            tenderLockType, 
                            deliveryLockTime, 
                            deliveryLockType, 
                            "SBTest", 
                            {from: root_acc, value: initStake}).then(function(instance) {
          contract = instance;
          console.log("       Adding new child node to root");
          return contract.addNode("First node", rootId, {from: root_acc});
        }).then( function(result) {
          console.log("       Applying for child node using child_acc");
          return contract.applyForNode(childId, candidateName, candidateStake, {from: child_acc});
        }).then( function(result) {
          console.log("       Approving child node candidate using root_acc");
          return contract.approveNode(childId, candidateId, {from: root_acc});
        }).then( function(result) {
          console.log("       Waiting until finished state...");
          sleep(4);
          console.log("       Withdraw stake using root_acc");
          return contract.withdraw(childId, {from: root_acc});
        }).then(function (result) {
          // Check if state has been flipped
          return contract.getNodeVars(childId);
        }).then( function(attributes) {
          // // uint stake, NodeState state, uint[] cands, uint[] childs
          var state = attributes[1].toNumber();
          assert.equal(state, payedState, "Node owner should be able to withdraw their stake after completion!");
        });
    });
    it("should not allow double withdraw", function() {
      var contract;
      var root_acc = accounts[0];
      var child_acc = accounts[1];
  
      var tenderLockTime = 2; // in seconds or unix timestamp
      var tenderLockType = 1; // 0 = absolute, 1 = relative
      var deliveryLockTime = 4; // in seconds or unix timestamp
      var deliveryLockType = 1; // 0 = absolute, 1 = relative
      var initStake = web3.toWei(0.001, 'ether');
      var rootId = 0;
      var childId = 1;
      var candidateId = 0;
      var candidateName = "First candidate";
      var candidateStake = web3.toWei(0.0005, 'ether'); // in ether
      var payedState = 3;
      return SmartBudget.new(tenderLockTime, 
                            tenderLockType, 
                            deliveryLockTime, 
                            deliveryLockType, 
                            "SBTest", 
                            {from: root_acc, value: initStake}).then(function(instance) {
          contract = instance;
          console.log("       Adding new child node to root");
          return contract.addNode("First node", rootId, {from: root_acc});
        }).then( function(result) {
          console.log("       Applying for child node using child_acc");
          return contract.applyForNode(childId, candidateName, candidateStake, {from: child_acc});
        }).then( function(result) {
          console.log("       Approving child node candidate using root_acc");
          return contract.approveNode(childId, candidateId, {from: root_acc});
        }).then( function(result) {
          // Wait until DELIVERY
          console.log("       Waiting until delivery period...");
          sleep(2);
          console.log("       Mark node complete using root");
          return contract.markNodeComplete(childId, {from: root_acc});
        }).then(function (result) {
          // Withdraw
          // Wait until DELIVERY
          console.log("       Waiting until finished state...");
          sleep(2);
          console.log("       Withdraw stake using child_acc");
          return contract.withdraw(childId, {from: child_acc});
        }).then(function (result) {
          console.log("       Attempting second Withdrawal");
          return expect(
            contract.withdraw(childId, {from: child_acc})
          ).be.rejectedWith('VM Exception while processing transaction');
        });
    });
    it("should not allow root to withdraw if he marked the node completed", function() {
      var contract;
      var root_acc = accounts[0];
      var child_acc = accounts[1];
  
      var tenderLockTime = 2; // in seconds or unix timestamp
      var tenderLockType = 1; // 0 = absolute, 1 = relative
      var deliveryLockTime = 4; // in seconds or unix timestamp
      var deliveryLockType = 1; // 0 = absolute, 1 = relative
      var initStake = web3.toWei(0.001, 'ether');
      var rootId = 0;
      var childId = 1;
      var candidateId = 0;
      var candidateName = "First candidate";
      var candidateStake = web3.toWei(0.0005, 'ether'); // in ether
      var payedState = 3;
      return SmartBudget.new(tenderLockTime, 
                            tenderLockType, 
                            deliveryLockTime, 
                            deliveryLockType, 
                            "SBTest", 
                            {from: root_acc, value: initStake}).then(function(instance) {
          contract = instance;
          console.log("       Adding new child node to root");
          return contract.addNode("First node", rootId, {from: root_acc});
        }).then( function(result) {
          console.log("       Applying for child node using child_acc");
          return contract.applyForNode(childId, candidateName, candidateStake, {from: child_acc});
        }).then( function(result) {
          console.log("       Approving child node candidate using root_acc");
          return contract.approveNode(childId, candidateId, {from: root_acc});
        }).then( function(result) {
          // Wait until DELIVERY
          console.log("       Waiting until delivery period...");
          sleep(2);
          console.log("       Mark node complete using root");
          return contract.markNodeComplete(childId, {from: root_acc});
        }).then(function (result) {
          // Withdraw
          // Wait until FINISHED
          console.log("       Waiting until finished state...");
          sleep(2);
          console.log("       Attempting withdrawal with root");
          return expect(
            contract.withdraw(childId, {from: root_acc})
          ).be.rejectedWith('VM Exception while processing transaction');
        });
    });
    it("should allow root to withdraw all initial stake if the tendering did not succeed", function() {
      var contract;
      var root_acc = accounts[0];
      var child_acc = accounts[1];
  
      var tenderLockTime = 2; // in seconds or unix timestamp
      var tenderLockType = 1; // 0 = absolute, 1 = relative
      var deliveryLockTime = 4; // in seconds or unix timestamp
      var deliveryLockType = 1; // 0 = absolute, 1 = relative
      var initStake = web3.toWei(0.001, 'ether');
      var rootId = 0;
      var childId = 1;
      var candidateId = 0;
      var candidateName = "First candidate";
      var candidateStake = web3.toWei(0.0005, 'ether'); // in ether
      var payedState = 3;
      return SmartBudget.new(tenderLockTime, 
                            tenderLockType, 
                            deliveryLockTime, 
                            deliveryLockType, 
                            "SBTest", 
                            {from: root_acc, value: initStake}).then(function(instance) {
          contract = instance;
          console.log("       Adding new child node to root");
          return contract.addNode("First node", rootId, {from: root_acc});
        }).then( function(result) {
          console.log("       Applying for child node using child_acc");
          return contract.applyForNode(childId, candidateName, candidateStake, {from: child_acc});
        }).then( function(result) {
          // Wait until DELIVERY
          console.log("       Waiting until delivery period...");
          sleep(2);
          console.log("       Withdrawing with root");
          return contract.cancel({from: root_acc});
        }).then( function(result) {
          // Check balance
          var newContractBalance = web3.eth.getBalance(contract.address).toNumber();
          assert.equal(newContractBalance, 0, "Root should be able to cancel!");
        });
    });
    it("should not allow child_acc to withdraw all initial stake if the tendering did not succeed", function() {
      var contract;
      var root_acc = accounts[0];
      var child_acc = accounts[1];
  
      var tenderLockTime = 2; // in seconds or unix timestamp
      var tenderLockType = 1; // 0 = absolute, 1 = relative
      var deliveryLockTime = 4; // in seconds or unix timestamp
      var deliveryLockType = 1; // 0 = absolute, 1 = relative
      var initStake = web3.toWei(0.001, 'ether');
      var rootId = 0;
      var childId = 1;
      var candidateId = 0;
      var candidateName = "First candidate";
      var candidateStake = web3.toWei(0.0005, 'ether'); // in ether
      var payedState = 3;
      return SmartBudget.new(tenderLockTime, 
                            tenderLockType, 
                            deliveryLockTime, 
                            deliveryLockType, 
                            "SBTest", 
                            {from: root_acc, value: initStake}).then(function(instance) {
          contract = instance;
          console.log("       Adding new child node to root");
          return contract.addNode("First node", rootId, {from: root_acc});
        }).then( function(result) {
          console.log("       Applying for child node using child_acc");
          return contract.applyForNode(childId, candidateName, candidateStake, {from: child_acc});
        }).then( function(result) {
          // Wait until DELIVERY
          console.log("       Waiting until delivery period...");
          sleep(2);
          console.log("       Attempting withdrawal with child_acc");
          return expect(
            contract.cancel({from: child_acc})
          ).be.rejectedWith('VM Exception while processing transaction');
        });
    });
});
