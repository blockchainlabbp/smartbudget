var app = require("./app.js");


window.SearchView = {
    searchContract: function () {
        $("#searchBtn").click(function () {
            var name = $("#findByName").val();
            var status = $("#statusCategory").val();
            Controller.findNodes([name, status]);
        })
    },

    setSearchResult: function (val) {
        $("#searchResult").empty();
        for (var i in val) {
            $("#searchResult").append("<tr><td>" + val[i].name + "</td><td>" + val[i].stake + "</td><td>" + val[i].state + "</td></tr>");
            
        }
    }
};


window.Controller = {
    init: function () {
        SearchView.searchContract();
    },

    findNodes: function (searchTerm) {
        (async () => {
           var temp = [];
           contractAddresses = await SmartBudgetService.findAllInstances(window.activeVersion);
            for (var i in contractAddresses) {
                var contract = await SmartBudgetService.fromAddress(window.contractAddresses[i]);
                var result = await contract.getFilteredNodes(0, 10, searchTerm);
                temp = temp.concat(result);
            }           
            
            window.SearchView.setSearchResult(temp);
        })();
    }
};

window.addEventListener('load', function() {
    window.App.start();
    window.SearchView.searchContract();
});

