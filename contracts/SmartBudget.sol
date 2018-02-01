pragma solidity ^0.4.17;

/** @title Smart Budget. */
contract SmartBudget {

  /** @dev Node struct for internal function
  * @param id address of node owner
  * @param stake stake on the node
  * @param desc description about goal of node (for example: web design etc.)
  * @param parentId id of parent node (in case of root nodes parentID is equal with id)
  */
  struct Node {
      address id;
      uint stake;
      string desc;
      address parentId;
  }

  /** nodes - Node struct array */
  Node[] nodes;

  /** numOfNodes - uint */
  uint numOfNodes;

  /** ids - address array for web3js */
  address[] ids;
  /** stakes - uint array for web3js */
  uint[] stakes;
  /** descriptions - string array for web3js */
  string[] descriptions;
  /** parentIds - address array for web3js */
  address[] parentIds;

  /** @dev Add a root node
  * @param stake uint The initial stake
  * @param desc string description about goal of node
  */
  function addRoot(uint stake, string desc) public {
      
      nodes.push(Node(msg.sender, stake, desc, msg.sender));

      ids.push(msg.sender);
      stakes.push(stake);
      descriptions.push(desc);
      parentIds.push(msg.sender);
      
      numOfNodes = numOfNodes + 1;
  }

  /** @dev Add child node
  * @param stake uint amount of stake (comes from initial stake)
  * @param desc string description about goal of node
  * @param parentId address address of parent node
  */
  function addChild(uint stake, string desc, address parentId) public {
      nodes.push(Node(msg.sender, stake, desc, parentId));

      ids.push(msg.sender);
      stakes.push(stake);
      descriptions.push(desc);
      parentIds.push(parentId);

      numOfNodes = numOfNodes + 1;
  }

  /** @dev web3js getter to reach ids
  * @return _ids address array
  */
  function getIds() public view returns (address[] _ids) {
      return ids;
  }

  /** @dev web3js getter to reach attributes of nodes
  * @return _ids address array
  * @return _stakes uint array
  * @return _parentIds address array
  */
  function getNodes() public view returns (address[] _ids, uint[] _stakes, address[] _parentIds) {
      return(ids, stakes, parentIds);
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
      // Datastructure consructor
      numOfNodes = 0;

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
