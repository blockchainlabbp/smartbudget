pragma solidity ^0.4.17;

contract SmartBudget {

  address owner;
  //timestamp
  uint lockTime;
  // Lock time type
  // 0 - Absolute (standard unix timestamp is seconds)
  // 1 - Relative (seconds relative to constructor block's timestamp)
  uint lockType;

  function SmartBudget(uint initLock, uint _lockType) public payable {
      // TODO: send back ether to sender in case of failure
      require(_lockType == 0 || _lockType == 1);
      owner = msg.sender;
      lockType = _lockType;
      if (lockType == 0) {
        require(initLock > block.timestamp);
        lockTime = initLock;
      } else {
        lockTime = block.timestamp + initLock;
      }
  }

  function getLockTime() constant public returns(uint) {
      return lockTime;
  }

  function getRemainingLockTime() constant public returns(uint) {
      return lockTime - block.timestamp > 0 ? lockTime - block.timestamp : 0;
  }

  function extendsLockTime(uint newLock, uint _lockType) public onlyOwner {
    require(_lockType == 0 || _lockType == 1);
      lockType = _lockType;
      if (lockType == 0) {
        require(newLock > block.timestamp);
        lockTime = newLock;
      } else {
        lockTime = block.timestamp + newLock;
      }
  }

  function isUnlocked() constant public returns (bool) {
    return block.timestamp >= lockTime;
  }

  modifier onlyOwner() { require(msg.sender == owner); _; }
  modifier onlyWhenUnlocked() { require(isUnlocked()); _; }

  //can be triggered with JS
  function transferFunds() public payable onlyOwner onlyWhenUnlocked {
    owner.transfer(address(this).balance);
  }
}
