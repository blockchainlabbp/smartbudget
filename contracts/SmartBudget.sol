pragma solidity ^0.4.17;

/** @title Smart Budget. */
contract SmartBudget {

  /** @dev Node struct for internal function
  * @param id address of node owner
  * @param stake stake on the node
  * @param desc description about goal of node (for example: web design etc.)
  * @param parentId id of parent node (in case of root nodes parentID is equal with id)
  */
  /*
  struct Node {
      address id;
      uint stake;
      string desc;
      address parentId;
  }
  */

  /** nodes - Node struct array */
  //Node[] nodes;

  /** currNodeIndex - uint */
  int currNodeIndex = -1;

  /** ids - a numerical id of the node */
  int[] ids;
  /** stakes - uint array for web3js */
  uint[] stakes;
  /** descriptions - string array for web3js */
  string[] descriptions;
  /** parentIds - numerical id of parent node */
  int[] parentIds;
  /** addresses - address of the node */
  address[] addresses;

  /** @dev Add a root node
  * @param desc string description about goal of node
  */
  function addRoot(string desc) private {

      currNodeIndex = currNodeIndex + 1;
      ids.push(currNodeIndex);
      stakes.push(msg.value);
      descriptions.push(desc);
      addresses.push(msg.sender);
      parentIds.push(currNodeIndex);
  }

  /** @dev Add child node
  * @param stake uint amount of stake (comes from initial stake)
  * @param desc string description about goal of node
  * @param parentId address address of parent node
  */
  function addChild(uint stake, string desc, int parentId) public {

      currNodeIndex = currNodeIndex + 1;
      ids.push(currNodeIndex);
      stakes.push(stake);
      descriptions.push(desc);
      addresses.push(msg.sender);
      parentIds.push(parentId);
  }

  /** @dev web3js getter to reach ids
  * @return _ids address array
  */
  function getIds() public view returns (int[] _ids) {
      return ids;
  }

  /** @dev web3js getter to reach attributes of nodes
  * @return _ids address array
  * @return _stakes uint array
  * @return _parentIds address array
  */
  function getNodes() public view returns (int[] _ids, uint[] _stakes, int[] _parentIds, address[] _addresses) {
      return(ids, stakes, parentIds, addresses);
  }

  /** @dev web3js getter to reach description of certain node
  * @param index uint index of certain node in descriptions array
  * @return desc string
  */
  function getNodeDesc(uint index) public view returns (string desc) {
      return descriptions[index];
  }

  /** address owner */
  address owner;
  /** lockTime - timestamp */
  uint lockTime;
  
  /** Lock time type
  * 0 - Absolute (standard unix timestamp is seconds)
  * 1 - Relative (seconds relative to constructor block's timestamp)
  */
  uint lockType;
  
  /** @dev Payable constructor for locking an amount of ether for a specific time
    * @param initLock The initial lockTime
    * @param _lockType Lock type
    */
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

      addRoot("something");
  }  
  
  /** @dev Get locktime
    * @return lockTime The locktime
    */
  function getLockTime() constant public returns(uint) {
      return lockTime;
  }

  /** @dev Calculate and retrieve remaining locktime
    * @return The remaining locktime
    */
  function getRemainingLockTime() constant public returns(uint) {
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
    * @return Is unlocked
    */
  function isUnlocked() constant public returns (bool) {
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
