pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/SmartBudget.sol";

contract TestSmartBudget {

  function testInitialBalance() public {
    SmartBudget smartBudget = SmartBudget(DeployedAddresses.SmartBudget());

    uint256 expected = 1 ether;
    uint256 actual = smartBudget.balance;

    Assert.equal(actual, expected, "The deployed contract should have 30 ethers initially");
  }

  function testInitialTimeLock() public {
      SmartBudget smartBudget = SmartBudget(DeployedAddresses.SmartBudget());

      bool expectedIsUnlocked = false;
      bool actualIsUnlocked = smartBudget.isUnlocked();
      Assert.equal(expectedIsUnlocked, actualIsUnlocked, "The contract should be locked right after creation");
  }
}
