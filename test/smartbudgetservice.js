const app = require("../app/javascripts/smartbudgetservice.js");

describe("something", function() {
    it("tree test" , function() {
      var tree = {id : -1, children : [
        {id : 1, children : [
          {id : 2, children : []}
        ]},
        {id : 3, children : []}
      ]};

      console.log(app.SmartBudgetService._isTreeElem(tree, -1));

      console.log(app.SmartBudgetService._findTreeElem(tree, 2));
      console.log(app.SmartBudgetService._findTreeElem(tree, 3));
    });

    it("should do things", function() {
      var triplet = [
        // ids
        [0, 1, 2, 3],

        // stakes
        [100, 10, 15, 10],

        // parentids
        [0, 0, 1, 2],

        // addresses
        [1234, 1235, 1236, 1237]
      ];

      console.log(triplet);
      
      triplet = app.SmartBudgetService._convertTriplet1(triplet);
      console.log(triplet);
      
      triplet = app.SmartBudgetService._convertTriplet2(triplet);
      console.log(triplet);

      var tree = app.SmartBudgetService._convertTriplet3(triplet);
      app.SmartBudgetService._visitTree({children:tree}, (node) => console.log(node));
    });

  });