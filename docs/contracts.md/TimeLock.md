* [TimeLock](#timelock)
  * [tenderLockTime](#function-tenderlocktime)
  * [toUnixTime](#function-tounixtime)
  * [deliveryLockTime](#function-deliverylocktime)
  * [transferFunds](#function-transferfunds)
  * [getLockState](#function-getlockstate)
  * [extendLockTimes](#function-extendlocktimes)

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