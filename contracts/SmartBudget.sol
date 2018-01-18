pragma solidity ^0.4.17;

contract SmartBudget {

  address owner;
  //timestamp
  uint lockTime;

  function SmartBudget(uint initLock) public payable {
    assert(initLock > block.timestamp);
    owner = msg.sender;
    lockTime = initLock;
  }

  function getLockTime() constant public returns(uint) {
      return lockTime;
  }

  function extendsLockTime(uint newLock) public onlyOwner {
    assert(newLock > lockTime);
    lockTime = newLock;
  }

  function isUnlocked() constant private returns (bool) {
    return block.timestamp >= lockTime;
  }

  modifier onlyOwner() { require(msg.sender == owner); _; }
  modifier onlyWhenUnlocked() { require(isUnlocked()); _; }

  //can be triggered with JS
  function transferFunds() public payable onlyOwner onlyWhenUnlocked {
    owner.transfer(address(this).balance);
  }
}
