var SmartBudget = artifacts.require("./SmartBudget.sol");
var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;
var assert = chai.assert; 
// Some help on the available functions:
// https://github.com/trufflesuite/truffle-contract

function sleep(seconds) 
{
  var e = new Date().getTime() + (seconds * 1000);
  while (new Date().getTime() <= e) {}
}

// http://truffleframework.com/docs/getting_started/javascript-tests#use-contract-instead-of-describe-
contract('SmartBudget:ApprovalTests', function(accounts) {
  it("should allow root to approve candidate in child node", function() {
    
  });
  it("should not allow child_acc to approve itself in child node", function() {
    
  });
  it("should not allow child_acc to approve itself in child node", function() {
    
  });
  it("should not allow approval after the TENDER period", function() {
    
  });
  it("should not allow reapproval of nodes in APPROVED state", function() {
    
  });
});
