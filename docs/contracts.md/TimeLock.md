* [TimeLock](#timelock)
  * [lockTime](#function-locktime)
  * [lockType](#function-locktype)
  * [getRemainingLockTime](#function-getremaininglocktime)
  * [isUnlocked](#function-isunlocked)
  * [transferFunds](#function-transferfunds)
  * [extendsLockTime](#function-extendslocktime)

# TimeLock


## *function* lockTime

TimeLock.lockTime() `view` `0d668087`





## *function* lockType

TimeLock.lockType() `view` `765d4897`





## *function* getRemainingLockTime

TimeLock.getRemainingLockTime() `view` `7a8cd156`

**Calculate and retrieve remaining locktime**




Outputs

| | | |
|-|-|-|
| *uint256* | remLockTime | The remaining locktime in seconds |

## *function* isUnlocked

TimeLock.isUnlocked() `view` `8380edb7`

**Returns true if timeLock has elapsed, false otherwise**




Outputs

| | | |
|-|-|-|
| *bool* | lockStatus | True if contract is unlocked |

## *function* transferFunds

TimeLock.transferFunds(recipient, amount) `nonpayable` `990dc9db`

**Send amount to recipient's address**


Inputs

| | | |
|-|-|-|
| *address* | recipient | The recipient |
| *uint256* | amount | The amount |


## *function* extendsLockTime

TimeLock.extendsLockTime(newLock, _lockType) `nonpayable` `adbbe8c6`

**Extend lockTime to a specific time or extend it with specific seconds**


Inputs

| | | |
|-|-|-|
| *uint256* | newLock | The new lockTime (timestamp, or seconds) |
| *uint256* | _lockType | The new lockType (0 or 1) |




---