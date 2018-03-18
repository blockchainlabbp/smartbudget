* [SmartBudget](#smartbudget)
  * [getAllocatedStake](#function-getallocatedstake)
  * [candidateCntr](#function-candidatecntr)
  * [getNodesWeb](#function-getnodesweb)
  * [withdraw](#function-withdraw)
  * [getAvailableStake](#function-getavailablestake)
  * [tenderLockTime](#function-tenderlocktime)
  * [getNodeWeb](#function-getnodeweb)
  * [addNode](#function-addnode)
  * [addRoot](#function-addroot)
  * [approveNode](#function-approvenode)
  * [toUnixTime](#function-tounixtime)
  * [deliveryLockTime](#function-deliverylocktime)
  * [transferFunds](#function-transferfunds)
  * [applyForNode](#function-applyfornode)
  * [getLockState](#function-getlockstate)
  * [getNodeCandidatesAddressesWeb](#function-getnodecandidatesaddressesweb)
  * [extendLockTimes](#function-extendlocktimes)
  * [nodeCntr](#function-nodecntr)
* [TimeLock](#timelock)
  * [tenderLockTime](#function-tenderlocktime)
  * [toUnixTime](#function-tounixtime)
  * [deliveryLockTime](#function-deliverylocktime)
  * [transferFunds](#function-transferfunds)
  * [getLockState](#function-getlockstate)
  * [extendLockTimes](#function-extendlocktimes)

# SmartBudget


## *function* getAllocatedStake

SmartBudget.getAllocatedStake(id) `view` `1433bf74`

**Returns the sum of stakes allocated to childrens of node**


Inputs

| | | |
|-|-|-|
| *uint256* | id | The id of node to compute the total allocated stakes for |

Outputs

| | | |
|-|-|-|
| *uint256* | allocatedStake | The amount of stake allocated to child nodes |

## *function* candidateCntr

SmartBudget.candidateCntr() `view` `1c2734d3`





## *function* getNodesWeb

SmartBudget.getNodesWeb() `view` `2bd40414`

**[web3js] Get the most important node details from the contract. Can be used to build the tree on JS side**

> Due to limitations in Solidity, we can only return tuples of arrays, but not tuples of array of arrays (e.g. array of strings) 



Outputs

| | | |
|-|-|-|
| *uint256[]* | _ids | ids of the nodes |
| *uint256[]* | _stakes | stakes of the nodes |
| *uint256[]* | _parents | parents of the nodes |
| *address[]* | _addresses | addresses of the nodes |

## *function* withdraw

SmartBudget.withdraw(id) `nonpayable` `2e1a7d4d`

**Withdraw promised amount**

> We require here an id to prevent the runtime scale linearly with the number of nodes. Frontend should get all node details and find the id. However, address is checked here!

Inputs

| | | |
|-|-|-|
| *uint256* | id | The id of the node to retreive the promised amount from |


## *function* getAvailableStake

SmartBudget.getAvailableStake(id) `view` `313ae45a`

**Returns the amount of stake available for allocation for node**

> Always use getAllocatedStake() or getAvailableStake() explicitly.  Currently stake = getAllocatedStake + getAvailableStake,  but we might add finer categorization later  (e.g. stakes locked for some distinctive reason),  while this interface won't change

Inputs

| | | |
|-|-|-|
| *uint256* | id | The id of the node to compute the available stakes for |

Outputs

| | | |
|-|-|-|
| *uint256* | availableStake | The amount of stake available for allocation |

## *function* tenderLockTime

SmartBudget.tenderLockTime() `view` `3d0ced49`





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

## *function* addNode

SmartBudget.addNode(desc, parent) `nonpayable` `44be7f70`

**Add a new empty node**


Inputs

| | | |
|-|-|-|
| *string* | desc | Description of node |
| *uint256* | parent | Parent's id of node |


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


## *function* toUnixTime

SmartBudget.toUnixTime(_time, _type) `view` `83b52eb4`

**Standardize relative or absolute time specification to unix timestamp**


Inputs

| | | |
|-|-|-|
| *uint256* | _time | undefined |
| *uint256* | _type | undefined |

Outputs

| | | |
|-|-|-|
| *uint256* | unixtime | The unix timestamp |

## *function* deliveryLockTime

SmartBudget.deliveryLockTime() `view` `97e292bc`





## *function* transferFunds

SmartBudget.transferFunds(recipient, amount) `nonpayable` `990dc9db`

**Send amount to recipient's address after the delivery time lock has expired**


Inputs

| | | |
|-|-|-|
| *address* | recipient | The recipient |
| *uint256* | amount | The amount |


## *function* applyForNode

SmartBudget.applyForNode(nodeId, name, stake) `nonpayable` `ac35de92`

**Add candidate to certain node**


Inputs

| | | |
|-|-|-|
| *uint256* | nodeId | Id of the node |
| *string* | name | Candidate's name |
| *uint256* | stake | Stake demanded by the candidate |


## *function* getLockState

SmartBudget.getLockState() `view` `cc7d9ade`

**Returns the current lock status enum**




Outputs

| | | |
|-|-|-|
| *uint256* | lockState | LockState enum representing the contract status |

## *function* getNodeCandidatesAddressesWeb

SmartBudget.getNodeCandidatesAddressesWeb(_key) `view` `d1a90f4b`

**[web3js] Get all addresses of candidate**


Inputs

| | | |
|-|-|-|
| *uint256* | _key | undefined |

Outputs

| | | |
|-|-|-|
| *address[]* | _addr | Array of candidate addresses of node |

## *function* extendLockTimes

SmartBudget.extendLockTimes(_tenderLockTime, _tenderLockType, _deliveryLockTime, _deliveryLockType) `nonpayable` `ead30a20`

**Extend lock times**


Inputs

| | | |
|-|-|-|
| *uint256* | _tenderLockTime | Tender lock time, absolute or relative |
| *uint256* | _tenderLockType | Tender lock type, 0 for absolute, 1 for relative |
| *uint256* | _deliveryLockTime | Delivery lock time, absolute or relative |
| *uint256* | _deliveryLockType | Delivery lock type, 0 for absolute, 1 for relative |


## *function* nodeCntr

SmartBudget.nodeCntr() `view` `ef5bd6e8`







---
# TimeLock


## *function* tenderLockTime

TimeLock.tenderLockTime() `view` `3d0ced49`





## *function* toUnixTime

TimeLock.toUnixTime(_time, _type) `view` `83b52eb4`

**Standardize relative or absolute time specification to unix timestamp**


Inputs

| | | |
|-|-|-|
| *uint256* | _time | undefined |
| *uint256* | _type | undefined |

Outputs

| | | |
|-|-|-|
| *uint256* | unixtime | The unix timestamp |

## *function* deliveryLockTime

TimeLock.deliveryLockTime() `view` `97e292bc`





## *function* transferFunds

TimeLock.transferFunds(recipient, amount) `nonpayable` `990dc9db`

**Send amount to recipient's address after the delivery time lock has expired**


Inputs

| | | |
|-|-|-|
| *address* | recipient | The recipient |
| *uint256* | amount | The amount |


## *function* getLockState

TimeLock.getLockState() `view` `cc7d9ade`

**Returns the current lock status enum**




Outputs

| | | |
|-|-|-|
| *uint256* | lockState | LockState enum representing the contract status |

## *function* extendLockTimes

TimeLock.extendLockTimes(_tenderLockTime, _tenderLockType, _deliveryLockTime, _deliveryLockType) `nonpayable` `ead30a20`

**Extend lock times**


Inputs

| | | |
|-|-|-|
| *uint256* | _tenderLockTime | Tender lock time, absolute or relative |
| *uint256* | _tenderLockType | Tender lock type, 0 for absolute, 1 for relative |
| *uint256* | _deliveryLockTime | Delivery lock time, absolute or relative |
| *uint256* | _deliveryLockType | Delivery lock type, 0 for absolute, 1 for relative |




---