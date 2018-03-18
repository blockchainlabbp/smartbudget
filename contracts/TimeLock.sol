pragma solidity ^0.4.17;

/** @title Smart Budget. */
contract TimeLock {
  /*
  * LockState enum disrcibes the state of the time lock.
  * INVALID - 0 - For special purposes, not used currently
  * TENDER - 1 - Contract is in the tender period
  * DELIVERY - 2 - Contract is in delivery period
  * FINISHED - 3 - Delivery time lock has expired
  */
  enum LockState {INVALID, TENDER, DELIVERY, FINISHED}

  /** address owner */
  address owner;
  /** lockTime - unix timestamp, same unit as block.timestamp */
  uint public tenderLockTime;
  uint public deliveryLockTime;

    /** Verifies if message sender is the contract's owner */
  modifier onlyOwner() {require(msg.sender == owner); _;}
  
  /** @notice Standardize relative or absolute time specification to unix timestamp
    * @return {
    *  "unixtime" : "The unix timestamp"
    * }
    */
  function toUnixTime(uint _time, uint _type) public view returns(uint unixtime) {
    if (_type == 0) {
      // Absolue time specification, should be a unix timestamp directly comparable to block.timestamp
      require(_time > block.timestamp);
      return _time;
    } else if (_type == 1) {
      // Relative time specification, in seconds
      return block.timestamp + _time;
    } else {
      // Time specification has to be either absolute or relative
      revert();
    }
  }

    /** @notice Extend lock times
    * @param _tenderLockTime Tender lock time, absolute or relative
    * @param _tenderLockType Tender lock type, 0 for absolute, 1 for relative
    * @param _deliveryLockTime Delivery lock time, absolute or relative
    * @param _deliveryLockType Delivery lock type, 0 for absolute, 1 for relative
    */
  function extendLockTimes(uint _tenderLockTime, uint _tenderLockType, uint _deliveryLockTime, uint _deliveryLockType) public onlyOwner {
    // First update the delivery lock time
    uint newDeliveryLockTime = toUnixTime(_deliveryLockTime, _deliveryLockType);
    require(newDeliveryLockTime >= deliveryLockTime);
    deliveryLockTime = newDeliveryLockTime;
    // Next update the tender lock time
    uint newTenderLockTime = toUnixTime(_tenderLockTime, _tenderLockType);
    require(newTenderLockTime >= tenderLockTime);
    tenderLockTime = newTenderLockTime;
    // Delivery time should be after tender lock time
    require(deliveryLockTime > tenderLockTime);
  }

  /** @notice Constructor for creating a new contract instance
    * @param _tenderLockTime Tender lock time, absolute or relative
    * @param _tenderLockType Tender lock type, 0 for absolute, 1 for relative
    * @param _deliveryLockTime Delivery lock time, absolute or relative
    * @param _deliveryLockType Delivery lock type, 0 for absolute, 1 for relative
    */
  function TimeLock(uint _tenderLockTime, uint _tenderLockType, uint _deliveryLockTime, uint _deliveryLockType) public payable {
    // Initalize to 0 explicitly, to be absolutely sure
    deliveryLockTime = 0;
    tenderLockTime = 0;
    owner = msg.sender;
    extendLockTimes(_tenderLockTime, _tenderLockType, _deliveryLockTime, _deliveryLockType);
  }
  
  /** @notice Fallback function - only callable by the owner of the contract
    * @dev Can be used to send more ether to the contract after creation
    */
  function () public payable onlyOwner {
  }

  /** @notice Returns the current lock status enum
    * @return {
    *  "lockState" : "LockState enum representing the contract status"
    * }
    */
  function getLockState() public view returns (uint lockState) {
    if (deliveryLockTime == 0 || tenderLockTime == 0) {
      return uint(LockState.INVALID);
    } else if (block.timestamp < tenderLockTime) {
      return uint(LockState.TENDER);
    } else if (block.timestamp < deliveryLockTime) {
      return uint(LockState.DELIVERY);
    } else {
      return uint(LockState.FINISHED);
    }
  }

  /** Verifies if the delivery time lock has elapsed */
  modifier onlyWhenUnlocked() {require(getLockState() == uint(LockState.FINISHED)); _;}

  /** @notice Send amount to recipient's address after the delivery time lock has expired
    * @param recipient The recipient
    * @param amount The amount
    */
  function transferFunds(address recipient, uint amount) public onlyOwner onlyWhenUnlocked {
    recipient.transfer(amount);
  }
}
