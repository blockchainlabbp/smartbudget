var app = require("./app");

window.NewProjectController = {
    init: function () {
        var dateFormat = "yy.mm.dd.";
        var today = new Date();
        var tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        var stakePrecision = $("#projectStake").prop("placeholder") || "0.001";
        var stekMinValue = $("#projectStake").prop("min") || 0;

        $("#newProjectForm").submit(window.NewProjectController.deployContract);
        
        $("#projectTenderDateTime").datepicker({
            minDate: today,
            dateFormat: dateFormat
        });
        $("#projectDeliveryDateTime").datepicker({
            minDate: tomorrow,
            dateFormat: dateFormat
        });

        $("#projectStake").spinner({
            step: stakePrecision,
            min: stekMinValue,
            incremental: true,
            numberFormat: "n"
        });
    },

    _toUnixTime: function (dateString) {
        return parseInt((new Date(dateString).getTime() / 1000).toFixed(0))
    },

    _setTimeToMidnight: function (dateTimeObj) {
        dateTimeObj.setHours(23);
        dateTimeObj.setMinutes(59);
        dateTimeObj.setSeconds(59);
        return dateTimeObj;
    },

    // Deploy new contract
    deployContract: async function (e) {
        e.preventDefault();
        $("#validationErrorDate, #validationErrorDate", $(this)).hide();

        var projectName = $("#projectName", $(this)).val();
        var projectTendetDate = $("#projectTenderDateTime", $(this)).datepicker( "getDate" );
        var projectDeliveryDate = $("#projectDeliveryDateTime", $(this)).datepicker("getDate");
        var projectStake = $("#projectStake", $(this)).val();

        if (projectTendetDate > projectDeliveryDate) {
            $("#validationErrorDate", $(this)).show();
            return false;
        }

        projectTendetDate = window.NewProjectController._setTimeToMidnight(projectTendetDate);
        projectDeliveryDate = window.NewProjectController._setTimeToMidnight(projectDeliveryDate);

        if ($(this)[0].checkValidity()) {
            console.log("deployContract", projectName, window.NewProjectController._toUnixTime(projectTendetDate), window.NewProjectController._toUnixTime(projectDeliveryDate), projectStake);

            try {
                window.App.startWaitOverlay();
                var newInst = await window.SmartBudgetService.create(
                    window.NewProjectController._toUnixTime(projectTendetDate),
                    0, //0 for absolute, 1 for relative
                    window.NewProjectController._toUnixTime(projectDeliveryDate),
                    0, //0 for absolute, 1 for relative
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
            } catch (e) {
                //
            }
            finally {
                window.App.endWaitOverlay();
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