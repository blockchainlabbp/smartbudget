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
        
        window.NewProjectController._initDateInputs("#tenderDateType", 
                                                    "#projectTenderDateTime", 
                                                    today, 
                                                    dateFormat);

        window.NewProjectController._initDateInputs("#deliveryDateType", 
                                                    "#projectDeliveryDateTime", 
                                                    tomorrow, 
                                                    dateFormat);

        $("#projectStake").spinner({
            step: stakePrecision,
            min: stekMinValue,
            incremental: true,
            numberFormat: "n"
        });
    },

    _initDateInputs: function(selectorId, inputId, _minDate, _format) {
        $(inputId).datepicker({
            minDate: _minDate,
            dateFormat: _format
        });

        $(selectorId).change(function () {
            if ($(`${selectorId} option:selected`).val() == 'absolute') {
                $(inputId).val("");
                $(inputId).datepicker({
                    minDate: _minDate,
                    dateFormat: _format
                });
            } else {
                $(inputId).val("");
                $(inputId).datepicker("destroy");
            }
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

    _parsePositiveInt: function(str, msg) {
        var res = parseInt(str);
        if (isNaN(res) || res <= 0) {    
            alert(msg);
            throw msg;
        } else {
            return res;
        }
    },

    _getDateTime: function(selectorId, inputId, refDate, msg) {
        if ($(`${selectorId} option:selected`).val() == 'absolute') {
            var rawDate = $(inputId).datepicker( "getDate" );
            return window.NewProjectController._setTimeToMidnight(rawDate);
        } else if ($(`${selectorId} option:selected`).val() == 'relative.sec') {
            var secs = window.NewProjectController._parsePositiveInt($(inputId).val(), msg);
            return new Date(refDate.getTime() + secs * 1000);
        } else if ($(`${selectorId} option:selected`).val() == 'relative.hour') {
            var hours = window.NewProjectController._parsePositiveInt($(inputId).val(), msg);
            return new Date(refDate.getTime() + hours * 3600 * 1000);
        } else if ($(`${selectorId} option:selected`).val() == 'relative.day') {
            var days = window.NewProjectController._parsePositiveInt($(inputId).val(), msg);
            return new Date(refDate.getTime() + days * 24 * 3600 * 1000);
        } else {
            error(`Unknown input type for selector ${selectorId}`);
        }
    },

    // Deploy new contract
    deployContract: async function (e) {
        e.preventDefault();
        $("#validationErrorDate, #validationErrorDate", $(this)).hide();

        var now = new Date();
        var projectName = $("#projectName", $(this)).val();
        var projectTenderDate = window.NewProjectController._getDateTime("#tenderDateType", 
                                                                         "#projectTenderDateTime",
                                                                         now,
                                                                         "Please provide a positive integer for the tender date specification")
        var projectDeliveryDate = window.NewProjectController._getDateTime("#deliveryDateType", 
                                                                           "#projectDeliveryDateTime",
                                                                           now,
                                                                           "Please provide a positive integer for the delivery date specification")

        var projectStake = $("#projectStake", $(this)).val();

        if (projectTenderDate > projectDeliveryDate) {
            $("#validationErrorDate", $(this)).show();
            return false;
        }

        if ($(this)[0].checkValidity()) {
            console.log("deployContract", projectName, window.NewProjectController._toUnixTime(projectTenderDate), window.NewProjectController._toUnixTime(projectDeliveryDate), projectStake);

            window.App.wait(async function() {
                var newInst = await window.SmartBudgetService.create(
                    window.NewProjectController._toUnixTime(projectTenderDate),
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
            });
        } else {
            $("#validationError", $(this)).show();
        }
    },
};

window.addEventListener('load', function () {
    window.App.start();
    window.NewProjectController.init();
});