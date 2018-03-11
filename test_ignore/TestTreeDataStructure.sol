pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/TreeDataStructure.sol";

contract TestTreeDataStructure {
  // Truffle will send TestTreeDataStructure the below amount of Ether after deploying the contract.
  // You can use it to perform testing of the contract that require ether transfer
  uint public initialBalance = 2 ether;

  function testConstructor() public {
    // Deploy a fresh instance to the blockchain
    TreeDataStructure tree = new TreeDataStructure();

    Assert.equal(tree.nodeCntr(),      0, "The tree after construction should have 0 nodes!");
    Assert.equal(tree.candidateCntr(), 0, "The tree after construction should have 0 candidates!");
  }

  function testAddRoot() public {
    // Deploy a fresh instance to the blockchain
    TreeDataStructure tree = new TreeDataStructure();
    
    // Create a new root with 1 ether stake
    tree.addRoot.value(1 ether)("NewRoot");
    Assert.equal(tree.nodeCntr(),      1, "The tree after root addition should have 1 node!");
    Assert.equal(tree.candidateCntr(), 0, "The tree after root addition should have 0 candidates!");
  }
}
