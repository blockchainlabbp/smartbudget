* [ConvertLib](#convertlib)
  * [convert](#function-convert)
* [MetaCoin](#metacoin)
  * [getBalanceInEth](#function-getbalanceineth)
  * [sendCoin](#function-sendcoin)
  * [getBalance](#function-getbalance)
  * [Transfer](#event-transfer)

# ConvertLib


## *function* convert

ConvertLib.convert(amount, conversionRate) `pure` `96e4ee3d`


Inputs

| | | |
|-|-|-|
| *uint256* | amount | undefined |
| *uint256* | conversionRate | undefined |


---
# MetaCoin


## *function* getBalanceInEth

MetaCoin.getBalanceInEth(addr) `view` `7bd703e8`


Inputs

| | | |
|-|-|-|
| *address* | addr | undefined |


## *function* sendCoin

MetaCoin.sendCoin(receiver, amount) `nonpayable` `90b98a11`


Inputs

| | | |
|-|-|-|
| *address* | receiver | undefined |
| *uint256* | amount | undefined |


## *function* getBalance

MetaCoin.getBalance(addr) `view` `f8b2cb4f`


Inputs

| | | |
|-|-|-|
| *address* | addr | undefined |


## *event* Transfer

MetaCoin.Transfer(_from, _to, _value) `ddf252ad`

Arguments

| | | |
|-|-|-|
| *address* | _from | indexed |
| *address* | _to | indexed |
| *uint256* | _value | not indexed |


---