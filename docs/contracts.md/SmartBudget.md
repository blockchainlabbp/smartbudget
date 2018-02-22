* [SmartBudget](#smartbudget)
  * [lockTime](#function-locktime)
  * [getNodesWeb](#function-getnodesweb)
  * [getNodeWeb](#function-getnodeweb)
  * [addRoot](#function-addroot)
  * [approveNode](#function-approvenode)
  * [addNode](#function-addnode)
  * [lockType](#function-locktype)
  * [getRemainingLockTime](#function-getremaininglocktime)
  * [isUnlocked](#function-isunlocked)
  * [transferFunds](#function-transferfunds)
  * [extendsLockTime](#function-extendslocktime)
  * [getNodeCandidatesAddressesWeb](#function-getnodecandidatesaddressesweb)
  * [applyForNode](#function-applyfornode)
* [TreeDataStructure](#treedatastructure)
  * [getNodesWeb](#function-getnodesweb)
  * [getNodeWeb](#function-getnodeweb)
  * [addRoot](#function-addroot)
  * [approveNode](#function-approvenode)
  * [addNode](#function-addnode)
  * [getNodeCandidatesAddressesWeb](#function-getnodecandidatesaddressesweb)
  * [applyForNode](#function-applyfornode)

# SmartBudget


## *function* lockTime

SmartBudget.lockTime() `view` `0d668087`





## *function* getNodesWeb

SmartBudget.getNodesWeb() `view` `2bd40414`

**[web3js] Get the most important node details from the contract. Can be used to build the tree on JS side**

> Due to limitations in Solidity, we can only return tuples of arrays, but not tuples of array of arrays (e.g. array of strings) 



Outputs

| | | |
|-|-|-|
| *uint256[]* | _ids | ids of the nodes |
| *uint256[]* | _parents | parents of the nodes |
| *uint8[]* | _states | states of the nodes |
| *uint256[]* | _stakes | stakes of the nodes |

## *function* getNodeWeb

SmartBudget.getNodeWeb(_key) `view` `3f002528`

**[web3js] Get a node by Id (id is the key in context of map)**


Inputs

| | | |
|-|-|-|
| *uint256* | _key | Id of the node |

Outputs

| | | |
|-|-|-|
| *uint256* | stake | Stake of node |
| *address* | addr | Address of node |
| *uint8* | state | State of node |
| *string* | desc | Description of node |
| *uint256* | parent | Id of parent node |
| *uint256[]* | childs | Array of child node ids |

## *function* addRoot

SmartBudget.addRoot(desc) `payable` `4e800896`

**Add special root element (onlyOwner) **

> A node is root if its id is equal to its parent id

Inputs

| | | |
|-|-|-|
| *string* | desc | Description of node (project) |


## *function* approveNode

SmartBudget.approveNode(nodeId, candidateKey) `nonpayable` `546c93c5`

**Set certain node state to APPROVED (onlyOwner)**


Inputs

| | | |
|-|-|-|
| *uint256* | nodeId | Id of the node |
| *uint256* | candidateKey | Identifier of candidate (id := key) |


## *function* addNode

SmartBudget.addNode(stake, desc, parent) `nonpayable` `75b6d9ce`

**Add node**


Inputs

| | | |
|-|-|-|
| *uint256* | stake | Ethereum stake on the node |
| *string* | desc | Description of node |
| *uint256* | parent | Parent's id of node |


## *function* lockType

SmartBudget.lockType() `view` `765d4897`





## *function* getRemainingLockTime

SmartBudget.getRemainingLockTime() `view` `7a8cd156`

> Calculate and retrieve remaining locktime



Outputs

| | | |
|-|-|-|
| *uint256* | remLockTime | The remaining locktime in seconds |

## *function* isUnlocked

SmartBudget.isUnlocked() `view` `8380edb7`

> Returns true if timeLock has elapsed, false otherwise



Outputs

| | | |
|-|-|-|
| *bool* | lockStatus | True if contract is unlocked |

## *function* transferFunds

SmartBudget.transferFunds(recipient, amount) `nonpayable` `990dc9db`

> Send amount to recipient's address

Inputs

| | | |
|-|-|-|
| *address* | recipient | The recipient |
| *uint256* | amount | The amount |


## *function* extendsLockTime

SmartBudget.extendsLockTime(newLock, _lockType) `nonpayable` `adbbe8c6`

> Extend lockTime to a specific time or extend it with specific seconds

Inputs

| | | |
|-|-|-|
| *uint256* | newLock | The new lockTime (timestamp, or seconds) |
| *uint256* | _lockType | The new lockType (0 or 1) |


## *function* getNodeCandidatesAddressesWeb

SmartBudget.getNodeCandidatesAddressesWeb(_key) `view` `d1a90f4b`

**[web3js] Get all addresses of candidates which are assigned with a certain node**


Inputs

| | | |
|-|-|-|
| *uint256* | _key | Id of the node |

Outputs

| | | |
|-|-|-|
| *address[]* | _addr | Array of candidate addresses of node |

## *function* applyForNode

SmartBudget.applyForNode(nodeId, name) `nonpayable` `f50365bb`

**Add candidate to certain node**


Inputs

| | | |
|-|-|-|
| *uint256* | nodeId | Id of the node |
| *string* | name | Candidate's name |




---
# TreeDataStructure


## *function* getNodesWeb

TreeDataStructure.getNodesWeb() `view` `2bd40414`

**[web3js] Get the most important node details from the contract. Can be used to build the tree on JS side**

> Due to limitations in Solidity, we can only return tuples of arrays, but not tuples of array of arrays (e.g. array of strings) 



Outputs

| | | |
|-|-|-|
| *uint256[]* | _ids | ids of the nodes |
| *uint256[]* | _parents | parents of the nodes |
| *uint8[]* | _states | states of the nodes |
| *uint256[]* | _stakes | stakes of the nodes |

## *function* getNodeWeb

TreeDataStructure.getNodeWeb(_key) `view` `3f002528`

**[web3js] Get a node by Id (id is the key in context of map)**


Inputs

| | | |
|-|-|-|
| *uint256* | _key | Id of the node |

Outputs

| | | |
|-|-|-|
| *uint256* | stake | Stake of node |
| *address* | addr | Address of node |
| *uint8* | state | State of node |
| *string* | desc | Description of node |
| *uint256* | parent | Id of parent node |
| *uint256[]* | childs | Array of child node ids |

## *function* addRoot

TreeDataStructure.addRoot(desc) `payable` `4e800896`

**Add special root element (onlyOwner) **

> A node is root if its id is equal to its parent id

Inputs

| | | |
|-|-|-|
| *string* | desc | Description of node (project) |


## *function* approveNode

TreeDataStructure.approveNode(nodeId, candidateKey) `nonpayable` `546c93c5`

**Set certain node state to APPROVED (onlyOwner)**


Inputs

| | | |
|-|-|-|
| *uint256* | nodeId | Id of the node |
| *uint256* | candidateKey | Identifier of candidate (id := key) |


## *function* addNode

TreeDataStructure.addNode(stake, desc, parent) `nonpayable` `75b6d9ce`

**Add node**


Inputs

| | | |
|-|-|-|
| *uint256* | stake | Ethereum stake on the node |
| *string* | desc | Description of node |
| *uint256* | parent | Parent's id of node |


## *function* getNodeCandidatesAddressesWeb

TreeDataStructure.getNodeCandidatesAddressesWeb(_key) `view` `d1a90f4b`

**[web3js] Get all addresses of candidates which are assigned with a certain node**


Inputs

| | | |
|-|-|-|
| *uint256* | _key | Id of the node |

Outputs

| | | |
|-|-|-|
| *address[]* | _addr | Array of candidate addresses of node |

## *function* applyForNode

TreeDataStructure.applyForNode(nodeId, name) `nonpayable` `f50365bb`

**Add candidate to certain node**


Inputs

| | | |
|-|-|-|
| *uint256* | nodeId | Id of the node |
| *string* | name | Candidate's name |



---