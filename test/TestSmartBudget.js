var SmartBudget = artifacts.require("./SmartBudget.sol");

// http://truffleframework.com/docs/getting_started/javascript-tests#use-contract-instead-of-describe-
contract('SmartBudget', function(accounts) {
  it("should have a root node after deployment", function() {
    var tree;
    var account_one = accounts[0];

    return SmartBudget.deployed().then(function(instance) {
        tree = instance;
        return tree.getNodesWeb.call({ from: account_one });
      }).then(function (nodesArray) {
        // (int[] _ids, uint[] _stakes, int[] _parentIds, address[] _addresses)
        assert.equal(nodesArray[0].length, 1, "Contract should have exatly one node after deployment!");
        var id = nodesArray[0][0];
        var stake = nodesArray[1][0].toNumber();  // Originally it is a BigInt, we need to convert it
        var parent = nodesArray[2][0];
        var address = nodesArray[3][0];
        var expectedStake = 1000000000000000000; // 1 ether in wei
        assert.equal(id, 0, "Root id must be 0!");
        assert.equal(stake, expectedStake, "Root stake must be 1 ether, as described by the migration script!");
        assert.equal(parent, 0, "Root parents must be itself = 0!");
        assert.equal(address, account_one, "Root address must be the first account in Ganache!");
    });
  });
  it("should have 2 nodes after adding a new node", function() {
    var tree;
    var account_one = accounts[0];
    var account_two = accounts[1];

    return SmartBudget.deployed().then(function(instance) {
        tree = instance;
        return tree.addNode.sendTransaction(web3.toWei(0.05, 'ether'), "TestChild", 0, { from: account_two});
      }).then( function() {
        return tree.getNodesWeb.call({ from: account_one });
      }).then(function (nodesArray) {
        // (int[] _ids, uint[] _stakes, int[] _parentIds, address[] _addresses)
        assert.equal(nodesArray[0].length, 2, "Contract should have exatly 2 nodes after one node addition!");
        var id = nodesArray[0][1];
        var stake = nodesArray[1][1].toNumber();  // Originally it is a BigInt, we need to convert it
        var parent = nodesArray[2][1];
        var address = nodesArray[3][1];
        var expectedStake = 50000000000000000; // 0.05 ether in wei
        assert.equal(id, 1, "Node id must be 1!");
        assert.equal(stake, expectedStake, "Root stake must be 1 ether, as described by the migration script!");
        assert.equal(parent, 0, "The parent of the first node must be root, which should have id = 0!");
        assert.equal(address, account_two, "The address of the first node must be the second address!");
    });
  });
});
