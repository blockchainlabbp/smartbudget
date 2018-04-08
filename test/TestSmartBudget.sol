pragma solidity ^0.4.21;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/SmartBudget.sol";

contract TestSmartBudget {
    function testInitialBalance() public {
        SmartBudget smartBudget = SmartBudget(DeployedAddresses.SmartBudget());

        uint256 expected = 1 ether;
        uint256 actual = address(smartBudget).balance;

        Assert.equal(actual, expected, "The deployed contract should have 1 ether initially");
    }

    function testInitialState() public {
        SmartBudget smartBudget = SmartBudget(DeployedAddresses.SmartBudget());

        uint expectedState = 1; // The uint value of TENDER
        uint actualState = smartBudget.getLockState();
        Assert.equal(expectedState, actualState, "The contract should be in TENDER status right after creation");
    }
}
