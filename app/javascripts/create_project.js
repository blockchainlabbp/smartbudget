var app = require("./app");

window.NewProjectController = {
    init: function () {
        $("#newProjectForm").submit(window.NewProjectController.deployContract);
    },

    _toUnixTime: function (dateString) {
        return parseInt((new Date(dateString).getTime() / 1000).toFixed(0))
    },

    // Deploy new contract
    deployContract: async function (e) {
        e.preventDefault();
        $("#validationErrorDate, #validationErrorDate", $(this)).hide();

        var projectName = $("#projectName", $(this)).val();
        var projectTendetDate = $("#projectTenderDateTime", $(this)).val();
        var projectDeliveryDate = $("#projectDeliveryDateTime", $(this)).val();
        var projectStake = $("#projectStake", $(this)).val();

        if (projectTendetDate > projectDeliveryDate) {
            $("#validationErrorDate", $(this)).show();
            return false;
        }

        if ($(this)[0].checkValidity()) {
            console.log("deployContract", projectName, window.NewProjectController._toUnixTime(projectTendetDate), window.NewProjectController._toUnixTime(projectDeliveryDate), projectStake);

            var smartBudgetService = await window.SmartBudgetService.create(
                window.NewProjectController._toUnixTime(projectTendetDate),
                0,
                window.NewProjectController._toUnixTime(projectDeliveryDate),
                0,
                projectName,
                projectStake,
                window.activeAccount
            );

            if (SmartBudgetService) {
                //contract created
                $(this).hide();
                $("#infoSuccess", "#projectContainer").show();
            }
        } else {
            $("#validationError", $(this)).show();
        }
    },
};

window.addEventListener('load', function () {
    window.App.start();
    window.NewProjectController.init();
});