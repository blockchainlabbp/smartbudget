* [SmartBudget](#smartbudget)
  * [getIds](#function-getids)
  * [addChild](#function-addchild)
  * [getRemainingLockTime](#function-getremaininglocktime)
  * [isUnlocked](#function-isunlocked)
  * [transferFunds](#function-transferfunds)
  * [getNodeDesc](#function-getnodedesc)
  * [extendsLockTime](#function-extendslocktime)
  * [getLockTime](#function-getlocktime)
  * [getNodes](#function-getnodes)

# SmartBudget


## *function* getIds

SmartBudget.getIds() `view` `2b105663`

> web3js getter to reach ids



Outputs

| | | |
|-|-|-|
| *uint16[]* | _ids | undefined |

## *function* addChild

SmartBudget.addChild(stake, desc, parentId) `nonpayable` `662dc13d`

> Add child node

Inputs

| | | |
|-|-|-|
| *uint256* | stake | uint amount of stake (comes from initial stake) |
| *string* | desc | string description about goal of node |
| *uint16* | parentId | address address of parent node |


## *function* getRemainingLockTime

SmartBudget.getRemainingLockTime() `view` `7a8cd156`

> Calculate and retrieve remaining locktime



Outputs

| | | |
|-|-|-|
| *uint256* |  | undefined |

## *function* isUnlocked

SmartBudget.isUnlocked() `view` `8380edb7`

> Returns true if timeLock has elapsed, false otherwise



Outputs

| | | |
|-|-|-|
| *bool* |  | undefined |

## *function* transferFunds

SmartBudget.transferFunds(recipient, amount) `nonpayable` `990dc9db`

> Send amount to recipient's address

Inputs

| | | |
|-|-|-|
| *address* | recipient | The recipient |
| *uint256* | amount | The amount |


## *function* getNodeDesc

SmartBudget.getNodeDesc(index) `view` `a6684a3a`

> web3js getter to reach description of certain node

Inputs

| | | |
|-|-|-|
| *uint16* | index | uint index of certain node in descriptions array |

Outputs

| | | |
|-|-|-|
| *string* | desc | undefined |

## *function* extendsLockTime

SmartBudget.extendsLockTime(newLock, _lockType) `nonpayable` `adbbe8c6`

> Extend lockTime to a specific time or extend it with specific seconds

Inputs

| | | |
|-|-|-|
| *uint256* | newLock | The new lockTime (timestamp, or seconds) |
| *uint256* | _lockType | The new lockType (0 or 1) |


## *function* getLockTime

SmartBudget.getLockTime() `view` `c0a4d64d`

> Get locktime



Outputs

| | | |
|-|-|-|
| *uint256* |  | undefined |

## *function* getNodes

SmartBudget.getNodes() `view` `e29581aa`

> web3js getter to reach attributes of nodes



Outputs

| | | |
|-|-|-|
| *uint16[]* | _ids | undefined |
| *uint256[]* | _stakes | undefined |
| *uint16[]* | _parentIds | undefined |
| *address[]* | _addresses | undefined |


---