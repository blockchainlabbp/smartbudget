var SmartBudget = artifacts.require("./TimeLock.sol");
var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;
var assert = chai.assert; 

// Some help on the available functions:
// https://github.com/trufflesuite/truffle-contract

// http://truffleframework.com/docs/getting_started/javascript-tests#use-contract-instead-of-describe-
contract('TimeLock', function(accounts) {
  it("should throw on deploy if lock type is invalid", function() {
    var root_acc = accounts[0];
    SmartBudget.defaults({from: root_acc});

    var tenderLockTime = 1000; // in seconds or unix timestamp
    var tenderLockType = 2; // 0 = absolute, 1 = relative
    var deliveryLockTime = 2000; // in seconds or unix timestamp
    var deliveryLockType = 1; // 0 = absolute, 1 = relative
    var initStake = web3.toWei(0.01, 'ether');
    return expect(
      SmartBudget.new(tenderLockTime, 
      tenderLockType, 
      deliveryLockTime, 
      deliveryLockType, 
      {from: root_acc, value: initStake})).be.rejectedWith('VM Exception while processing transaction');
  });

  it("should throw if delivery lock time is before tender lock time", function() {
    var root_acc = accounts[0];
    SmartBudget.defaults({from: root_acc});

    var tenderLockTime = 50; // in seconds or unix timestamp
    var tenderLockType = 1; // 0 = absolute, 1 = relative
    var deliveryLockTime = 20; // in seconds or unix timestamp
    var deliveryLockType = 1; // 0 = absolute, 1 = relative
    var initStake = web3.toWei(0.01, 'ether');
    return expect(
      SmartBudget.new(tenderLockTime, 
      tenderLockType, 
      deliveryLockTime, 
      deliveryLockType, 
      {from: root_acc, value: initStake})).be.rejectedWith('VM Exception while processing transaction');
  });

  it("should throw if lock time is before the block timestamp", function() {
    var root_acc = accounts[0];
    SmartBudget.defaults({from: root_acc});

    var tenderLockTime = 12; // old unix timestamp
    var tenderLockType = 0; // 0 = absolute, 1 = relative
    var deliveryLockTime = 20; // in seconds or unix timestamp
    var deliveryLockType = 1; // 0 = absolute, 1 = relative
    var initStake = web3.toWei(0.01, 'ether');
    return expect(
      SmartBudget.new(tenderLockTime, 
      tenderLockType, 
      deliveryLockTime, 
      deliveryLockType, 
      {from: root_acc, value: initStake})).be.rejectedWith('VM Exception while processing transaction');
  });

  it("should deploy with absolute time stamps", function() {
    var root_acc = accounts[0];
    SmartBudget.defaults({from: root_acc});

    var tenderLockTime = 33078300482; // unix timestamp in year 3018, should be ok for a while :)
    var tenderLockType = 0; // 0 = absolute, 1 = relative
    var deliveryLockTime = 33078300682; // in seconds or unix timestamp
    var deliveryLockType = 0; // 0 = absolute, 1 = relative
    var initStake = web3.toWei(0.01, 'ether');
    return expect(
      SmartBudget.new(tenderLockTime, 
      tenderLockType, 
      deliveryLockTime, 
      deliveryLockType, 
      {from: root_acc, value: initStake})).be.fulfilled;
  });

  it("should allow extending both time locks with valid settings", function() {
    var contract;
    var oldTenderLockTime;
    var newTenderLockTime;
    var oldDeliveryLockTime;
    var newDeliveryLockTime;
    var root_acc = accounts[0];
    SmartBudget.defaults({from: root_acc});

    var tenderLockTime = 10; // relative time in seconds
    var tenderLockType = 1; // 0 = absolute, 1 = relative
    var deliveryLockTime = 20; // in seconds or unix timestamp
    var deliveryLockType = 1; // 0 = absolute, 1 = relative
    var initStake = web3.toWei(0.01, 'ether');
    return SmartBudget.new(tenderLockTime, tenderLockType, deliveryLockTime, deliveryLockType, {value: initStake}).then(function(instance) {
      contract = instance;
      return contract.tenderLockTime();
    }).then( function(tLock) {
      oldTenderLockTime = parseInt(tLock);
      return contract.deliveryLockTime();
    }).then( function(dLock) {
      oldDeliveryLockTime = parseInt(dLock);
      // Update locktimes
      tenderLockTime = 11; // relative time in seconds
      tenderLockType = 1; // 0 = absolute, 1 = relative
      deliveryLockTime = 50; // in seconds or unix timestamp
      deliveryLockType = 1; // 0 = absolute, 1 = relative
      return  contract.extendLockTimes(tenderLockTime, tenderLockType, deliveryLockTime, deliveryLockType);
    }).then( function() {
      return contract.tenderLockTime();
    }).then( function(tLock) {
      newTenderLockTime = parseInt(tLock);
      return contract.deliveryLockTime();
    }).then( function(dLock) {
      newDeliveryLockTime = parseInt(dLock);
      return assert(newTenderLockTime > oldTenderLockTime && newDeliveryLockTime > oldDeliveryLockTime, 'Tender lock times should have increased.');
    });
  });

  it("should throw when trying to extend with invalid settings", function() {
    var contract;
    var root_acc = accounts[0];
    SmartBudget.defaults({from: root_acc});

    var tenderLockTime = 500; // relative time in seconds
    var tenderLockType = 1; // 0 = absolute, 1 = relative
    var deliveryLockTime = 2000; // in seconds or unix timestamp
    var deliveryLockType = 1; // 0 = absolute, 1 = relative
    var initStake = web3.toWei(0.01, 'ether');
    return SmartBudget.new(tenderLockTime, tenderLockType, deliveryLockTime, deliveryLockType, {value: initStake}).then(function(instance) {
      contract = instance;
      // Update locktimes
      tenderLockTime = 5; // relative time in seconds
      tenderLockType = 1; // 0 = absolute, 1 = relative
      deliveryLockTime = 2000; // in seconds or unix timestamp
      deliveryLockType = 1; // 0 = absolute, 1 = relative
      return  expect(
        contract.extendLockTimes(
          tenderLockTime, 
          tenderLockType, 
          deliveryLockTime, 
          deliveryLockType)
      ).be.rejectedWith('VM Exception while processing transaction');
    });
  });

  it("should allow extending tender time lock only", function() {
    var contract;
    var oldTenderLockTime;
    var newTenderLockTime;
    var oldDeliveryLockTime;
    var newDeliveryLockTime;
    var root_acc = accounts[0];
    SmartBudget.defaults({from: root_acc});

    var tenderLockTime = 200; // relative time in seconds
    var tenderLockType = 1; // 0 = absolute, 1 = relative
    var deliveryLockTime = 400; // in seconds or unix timestamp
    var deliveryLockType = 1; // 0 = absolute, 1 = relative
    var initStake = web3.toWei(0.01, 'ether');
    return SmartBudget.new(tenderLockTime, tenderLockType, deliveryLockTime, deliveryLockType, {value: initStake}).then(function(instance) {
      contract = instance;
      return contract.tenderLockTime();
    }).then( function(tLock) {
      oldTenderLockTime = parseInt(tLock);
      return contract.deliveryLockTime();
    }).then( function(dLock) {
      oldDeliveryLockTime = parseInt(dLock);
      // Update tender locktimes
      tenderLockTime = 201; // relative time is seconds
      tenderLockType = 1; // 0 = absolute, 1 = relative
      deliveryLockTime = oldDeliveryLockTime; // unix timestamp now
      deliveryLockType = 0; // 0 = absolute, 1 = relative
      return  contract.extendLockTimes(tenderLockTime, tenderLockType, deliveryLockTime, deliveryLockType);
    }).then( function() {
      return contract.tenderLockTime();
    }).then( function(tLock) {
      newTenderLockTime = parseInt(tLock);
      return contract.deliveryLockTime();
    }).then( function(dLock) {
      newDeliveryLockTime = parseInt(dLock);
      return assert(newTenderLockTime > oldTenderLockTime && newDeliveryLockTime == oldDeliveryLockTime, 'Delivery lock time should not have changed');
      });
  });

  it("should allow extending delivery time lock only", function() {
    var contract;
    var oldTenderLockTime;
    var newTenderLockTime;
    var oldDeliveryLockTime;
    var newDeliveryLockTime;
    var root_acc = accounts[0];
    SmartBudget.defaults({from: root_acc});

    var tenderLockTime = 200; // relative time in seconds
    var tenderLockType = 1; // 0 = absolute, 1 = relative
    var deliveryLockTime = 400; // in seconds or unix timestamp
    var deliveryLockType = 1; // 0 = absolute, 1 = relative
    var initStake = web3.toWei(0.01, 'ether');
    return SmartBudget.new(tenderLockTime, tenderLockType, deliveryLockTime, deliveryLockType, {value: initStake}).then(function(instance) {
      contract = instance;
      return contract.tenderLockTime();
    }).then( function(tLock) {
      oldTenderLockTime = parseInt(tLock);
      return contract.deliveryLockTime();
    }).then( function(dLock) {
      oldDeliveryLockTime = parseInt(dLock);
      // Update tender locktimes
      tenderLockTime = oldTenderLockTime; // unix timestamp now
      tenderLockType = 0; // 0 = absolute, 1 = relative
      deliveryLockTime = 401; // unix timestamp now
      deliveryLockType = 1; // 0 = absolute, 1 = relative
      return  contract.extendLockTimes(tenderLockTime, tenderLockType, deliveryLockTime, deliveryLockType);
    }).then( function() {
      return contract.tenderLockTime();
    }).then( function(tLock) {
      newTenderLockTime = parseInt(tLock);
      return contract.deliveryLockTime();
    }).then( function(dLock) {
      newDeliveryLockTime = parseInt(dLock);
      return assert(newTenderLockTime == oldTenderLockTime && newDeliveryLockTime > oldDeliveryLockTime, 'Tender lock time should not have changed');
      });
  });
});