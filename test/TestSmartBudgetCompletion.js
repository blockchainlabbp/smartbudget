var SmartBudget = artifacts.require("./SmartBudget.sol");
// Some help on the available functions:
// https://github.com/trufflesuite/truffle-contract

// http://truffleframework.com/docs/getting_started/javascript-tests#use-contract-instead-of-describe-
contract('SmartBudget:CompletionTests', function(accounts) {
  it("should mark first node complete", function() {
    var contract;
    var root_acc = accounts[0];
    var child_acc = accounts[1];

    var tenderLockTime = 1000; // in seconds or unix timestamp
    var tenderLockType = 1; // 0 = absolute, 1 = relative
    var deliveryLockTime = 2000; // in seconds or unix timestamp
    var deliveryLockType = 1; // 0 = absolute, 1 = relative
    var initStake = web3.toWei(0.01, 'ether');
    var nodeDesc = "First node";
    var parentId = 0;
    var nodeId = 1;
    var candidateId = 0;
    var candidateName = "First candidate";
    var candidateStake = web3.toWei(0.005, 'ether'); // in ether
    var lastNodeId;
    return SmartBudget.new(tenderLockTime, tenderLockType, deliveryLockTime, deliveryLockType, "SBTest", {from: root_acc, value: initStake}).then(function(instance) {
        contract = instance;
        return  contract.getNodeWeb(0);
      }).then( function(attributes) {
        assert.equal(attributes[0].toNumber(), initStake, "After deployment, init stake should be unchanged!");
        console.log("       Adding new node");
        return contract.addNode(nodeDesc, parentId);
      }).then( function(result) {
        // result.tx => transaction hash, string
        // result.logs => array of trigger events (1 item in this case)
        // result.receipt => receipt object
        return  contract.getNodeWeb(0);
      }).then( function(attributes) {
        assert.equal(attributes[0].toNumber(), initStake, "After adding first empty node, init stake should be unchaged!");
        console.log("       Applying for node");
        return contract.applyForNode(nodeId, candidateName, candidateStake, {from: child_acc});
      }).then( function(result) {
        // result.tx => transaction hash, string
        // result.logs => array of trigger events (1 item in this case)
        // result.receipt => receipt object
        console.log("       Approving candidate");
        return contract.approveNode(nodeId, candidateId);
      }).then( function(result) {
        // result.tx => transaction hash, string
        // result.logs => array of trigger events (1 item in this case)
        // result.receipt => receipt object
        return  contract.nodeCntr();
      }).then(function (nodeCntr) {
        lastNodeId = nodeCntr - 1;
        return contract.getNodesWeb(0, lastNodeId);
      }).then(function (nodesArray) {
        // (int[] _ids, uint[] _stakes, int[] _parentIds, address[] _addresses)
        assert.equal(nodesArray[0].length, 2, "Contract should have exatly 2 nodes after one node addition!");
        var id = nodesArray[0][1];
        var stake = nodesArray[1][1].toNumber();  // Originally it is a BigInt, we need to convert it
        var parent = nodesArray[2][1];
        var address = nodesArray[3][1];
        assert.equal(id, 1, "Node id must be 1!");
        assert.equal(stake, candidateStake, "Child node stake is incorrect!");
        assert.equal(parent, 0, "The parent of the first node must be root, which should have id = 0!");
        assert.equal(address, child_acc, "The address of the first node must be child_acc!");
    });
  });
});
