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

            var newInst = await window.SmartBudgetService.create(
                window.NewProjectController._toUnixTime(projectTendetDate),
                0,
                window.NewProjectController._toUnixTime(projectDeliveryDate),
                0,
                projectName,
                projectStake,
                window.activeAccount
            );

            if (newInst) {
                //contract created
                $(this).hide();
                $("#infoSuccess").append(`Your project have been successfully deployed at <button id='newInst' type='button special'>${newInst.address}</button>`).show();
                $("#newInst").click( function() {
                    window.App.saveActiveInstanceAddress(newInst.address);
                    window.location.href = '/project_details.html';
                });
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