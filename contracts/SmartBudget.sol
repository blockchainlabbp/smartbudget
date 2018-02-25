pragma solidity ^0.4.17;

import "./TreeDataStructure.sol";

/** @title Smart Budget. */
contract SmartBudget is TreeDataStructure {

  /** address owner */
  address owner;
  /** lockTime - timestamp */
  uint public lockTime;
  
  /** Lock time type
  * 0 - Absolute (standard unix timestamp is seconds)
  * 1 - Relative (seconds relative to constructor block's timestamp)
  */
  uint public lockType;
  
  /** @dev Payable constructor for locking an amount of ether for a specific time
    * @param initLock The initial lockTime
    * @param _lockType Lock type
    */
  function SmartBudget(uint initLock, uint _lockType) public payable {
    require(_lockType == 0 || _lockType == 1);
    owner = msg.sender;
    lockType = _lockType;
    if (lockType == 0) {
      require(initLock > block.timestamp);
      lockTime = initLock;
    } else {
      lockTime = block.timestamp + initLock;
    }

    // Add the root node
    addRoot("Root node");
  }  
  
  /** @dev Payable fallback function to receive more ether from the root (owner)
    */
  function () public payable onlyOwner {
  }

  /** @dev Calculate and retrieve remaining locktime
    * @return {
    *  "remLockTime" : "The remaining locktime in seconds"
    * }
    */
  function getRemainingLockTime() constant public returns(uint remLockTime) {
      return lockTime - block.timestamp > 0 ? lockTime - block.timestamp : 0;
  }

  /** @dev Extend lockTime to a specific time or extend it with specific seconds
    * @param newLock The new lockTime (timestamp, or seconds)
    * @param _lockType The new lockType (0 or 1)
    */
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

  /** @dev Returns true if timeLock has elapsed, false otherwise
    * @return {
    *  "lockStatus" : "True if contract is unlocked"
    * }
    */
  function isUnlocked() constant public returns (bool lockStatus) {
    return block.timestamp >= lockTime;
  }

  /** Verifies if message sender is the contract's owner */
  modifier onlyOwner() { require(msg.sender == owner); _; }
  /** Verifies if the timeLock has elapsed */
  modifier onlyWhenUnlocked() { require(isUnlocked()); _; }

  /** @dev Send amount to recipient's address
    * @param recipient The recipient
    * @param amount The amount
    */
  function transferFunds(address recipient, uint amount) public onlyOwner onlyWhenUnlocked {
    recipient.transfer(amount);
  }
}
