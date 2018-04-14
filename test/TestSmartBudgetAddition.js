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
contract('SmartBudget:AdditionTests', function(accounts) {
  it("should allow root to add 3 subprojects", function() {
    var contract;
    var root_acc = accounts[0];
    var child_acc = accounts[1];

    var tenderLockTime = 1000; // in seconds or unix timestamp
    var tenderLockType = 1; // 0 = absolute, 1 = relative
    var deliveryLockTime = 2000; // in seconds or unix timestamp
    var deliveryLockType = 1; // 0 = absolute, 1 = relative
    var initStake = web3.toWei(0.001, 'ether');
    var rootDesc = "SBTest";
    var rootId = 0;
    var lastNodeId;
    return SmartBudget.new(tenderLockTime, 
                          tenderLockType, 
                          deliveryLockTime, 
                          deliveryLockType, 
                          rootDesc, 
                          {from: root_acc, value: initStake}).then(function(instance) {
        contract = instance;
        return contract.addNode("First node", rootId);
      }).then( function(result) {
        //console.info("The result tx is : " + result.tx);
        //console.info("The result logs are : " + JSON.stringify(result.logs));
        //console.info("The result receipts are : " + JSON.stringify(result.receipt));
        return contract.addNode("Second node", rootId);
      }).then( function(result) {
        return contract.addNode("Third node", rootId);
      }).then( function(result) {
        return contract.nodeCntr();
      }).then(function (nodeCntr) {
        lastNodeId = nodeCntr - 1;
        return contract.getNodesWeb(0, lastNodeId);
      }).then(function (nodesArray) {
        // (int[] _ids, uint[] _stakes, int[] _parentIds, address[] _addresses)
        assert.equal(nodesArray[0].length, 4, "Contract should have exatly 4 nodes after 3 node addition!");
        var parentIds = nodesArray[2];
        assert.equal(parentIds[1], rootId, "The parent of all child nodes must the the root account!");
        assert.equal(parentIds[2], rootId, "The parent of all child nodes must the the root account!");
        assert.equal(parentIds[3], rootId, "The parent of all child nodes must the the root account!");
    });
  });

  it("should not allow root to add subprojects after the TENDER period", function() {
    var contract;
    var root_acc = accounts[0];
    var child_acc = accounts[1];

    var tenderLockTime = 1; // in seconds or unix timestamp
    var tenderLockType = 1; // 0 = absolute, 1 = relative
    var deliveryLockTime = 2000; // in seconds or unix timestamp
    var deliveryLockType = 1; // 0 = absolute, 1 = relative
    var initStake = web3.toWei(0.001, 'ether');
    var rootDesc = "SBTest";
    var rootId = 0;
    var lastNodeId;
    return SmartBudget.new(tenderLockTime, 
                          tenderLockType, 
                          deliveryLockTime, 
                          deliveryLockType, 
                          rootDesc, 
                          {from: root_acc, value: initStake}).then(function(instance) {
        contract = instance;
        // Wait until the TENDER time lock expires
        sleep(2);
        return expect(
          contract.addNode("First node", rootId)
        ).be.rejectedWith('VM Exception while processing transaction');
    });
  });

  it("should not allow root to add subproject to OPEN child nodes", function() {
    var contract;
    var root_acc = accounts[0];
    var child_acc = accounts[1];

    var tenderLockTime = 1000; // in seconds or unix timestamp
    var tenderLockType = 1; // 0 = absolute, 1 = relative
    var deliveryLockTime = 2000; // in seconds or unix timestamp
    var deliveryLockType = 1; // 0 = absolute, 1 = relative
    var initStake = web3.toWei(0.001, 'ether');
    var rootDesc = "SBTest";
    var rootId = 0;
    var childId = 1;
    var lastNodeId;
    return SmartBudget.new(tenderLockTime, 
                          tenderLockType, 
                          deliveryLockTime, 
                          deliveryLockType, 
                          rootDesc, 
                          {from: root_acc, value: initStake}).then(function(instance) {
        contract = instance;
        return contract.addNode("First node", rootId);
      }).then( function(result) {
        return expect(
          contract.addNode("Second node", childId)
        ).be.rejectedWith('VM Exception while processing transaction');
    });
  });

  it("should not allow root to add subproject to APPROVED child nodes", function() {
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
    var candidateName = "First candidate";
    var candidateStake = web3.toWei(0.0005, 'ether'); // in ether
    var lastNodeId;
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
        console.log("       Trying to add second child node to child node using root_acc");
        return expect(
          contract.addNode("Second node", childId, {from: root_acc})
        ).be.rejectedWith('VM Exception while processing transaction');
    });
  });

  it("should allow child owner to add subprojects", function() {
    var contract;
    var root_acc = accounts[0];
    var child_acc = accounts[1];

    var tenderLockTime = 1000; // in seconds or unix timestamp
    var tenderLockType = 1; // 0 = absolute, 1 = relative
    var deliveryLockTime = 2000; // in seconds or unix timestamp
    var deliveryLockType = 1; // 0 = absolute, 1 = relative
    var initStake = web3.toWei(0.001, 'ether');
    var rootId = 0;
    var childId = 1;
    var candidateId = 0;
    var candidateName = "First candidate";
    var candidateStake = web3.toWei(0.0005, 'ether'); // in ether
    var lastNodeId;
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
        console.log("       Adding second child node to child node using child_acc");
        return contract.addNode("Second node", childId, {from: child_acc});
      }).then(function (nodeCntr) {
        return contract.nodeCntr();
      }).then(function (nodeCntr) {
        lastNodeId = nodeCntr - 1;
        return contract.getNodesWeb(0, lastNodeId);
      }).then(function (nodesArray) {
        // (int[] _ids, uint[] _stakes, int[] _parentIds, address[] _addresses)
        assert.equal(nodesArray[0].length, 3, "Contract should have exatly 3 nodes after 2 node addition!");
        var parentIds = nodesArray[2];
        assert.equal(parentIds[0], rootId, "Root's parent should be itself (id 0)!");
        assert.equal(parentIds[1], rootId, "The parent of all child nodes must the the root account!");
        assert.equal(parentIds[2], childId, "The parent of all child nodes must the the root account!");
        var addresses = nodesArray[3];
        assert.equal(addresses[0], root_acc, "Root's owner should be root_acc!");
        assert.equal(addresses[1], child_acc, "The first child's owner should be child_acc!");
        assert.equal(addresses[2], "0x0000000000000000000000000000000000000000", "The second child shoud not have an owner yet!");
    });
  });
});
