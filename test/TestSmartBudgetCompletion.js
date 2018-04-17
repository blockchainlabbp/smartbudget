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
contract('SmartBudget:CompletionTests', function(accounts) {
  it("should allow root to mark first node complete", function() {
    
  });
  it("should not allow child_acc to mark first node complete", function() {
    
  });
  it("should not allow root to mark first node complete in TENDER period", function() {
    
  });
});
