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
contract('SmartBudget:ConstructorTests', function(accounts) {
    it("should return multiple nodes data", function() {
    
    });
    it("should return single node attributes", function() {
    
    });
    it("should return multiple candidate data", function() {
    
    });
    it("should return single candidate attributes", function() {
    
    });
});
