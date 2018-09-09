var app = require("./app");

window.NodeDetailsController = {

    scanCandidates: async function(nodeId) {
        var node = await window.activeInstance.getNodeWeb(nodeId);
        // Parse candidates
        await Promise.all(node.candidateIds.map( async (candidateId) => {
            var candidate = await window.activeInstance.getCandidateWeb(candidateId);
            if (!$(`#candidate${candidateId}`).length) {
                $('#candidates').append(` <button id='candidate${candidateId}' type='button' class='button candidate'>${candidate.name}, stake: ${web3.fromWei(candidate.stakeInWei, "ether")}</button>`);
                $(`#candidate${candidateId}`).click( function() {
                    window.activeCandidate = candidateId;
                    window.App.saveActiveCandidate();
                    window.activeNode = node.id;
                    window.App.saveActiveNode();
                    window.location.href = '/candidate_details.html';
                });
            }
        }));
    },

    scanSubprojects: async function(nodeId) {
        var node = await window.activeInstance.getNodeWeb(nodeId);
        // Parse subprojects
        await Promise.all(node.childIds.map( async (id) => {
            var n = await window.activeInstance.getNodeWeb(id);
            if (!$(`#node${id}`).length) {
                $('#subprojects').append(` <button id='node${id}' type='button' class='button node'>${n.name}</button>`);
                $(`#node${id}`).click( function() {
                    window.activeNode = id;
                    window.App.saveActiveNode();
                    window.location.href = '/node_details.html';
                });
            }
        }));
    },

    updateState: async function(nodeId) {
        var node = await window.activeInstance.getNodeWeb(nodeId);
        var root = await window.activeInstance.getNodeWeb(0);
        // Update state and stake
        var state;
        if (node.id == 0) {
            state = "ROOT";
        } else {
            state = node.state;
        }  
        $("#availStake").text(web3.fromWei(node.stakeInWei, "ether"));

        // Add new subproject button if owner and contract state is open
        window.App.onAccountChange( async function() {
            var contractState = await window.activeInstance.getContractState();
            //Add mark completed button if needed
            if ((contractState == "DELIVERY" || contractState == "FINISHED") && 
                root.address == window.activeAccount &&
                node.state == "APPROVED") {
                    $("#nodeStatus").text("");
                    $("#nodeStatus").append("<button type='button' class='button apply'>Mark completed</button>").click( function() {
                        window.activeInstance.markNodeComplete(window.activeAccount, node.id);
                    });
            } else {
                $("#nodeStatus").text(state);
            }

            if (node.address == window.activeAccount && contractState == "TENDER") {
                $("#newSubproject").click( async function() {
                    window.activeNode = node.id;
                    window.App.saveActiveNode();
                    window.location.href = '/create_node.html';
                }).show();
                $("#collectFeeBtn").hide();
            } else if (contractState == "FINISHED") {
                $("#newSubproject").hide();
                if (node.state == "COMPLETED" && node.address == window.activeAccount) {
                    $("#collectFeeBtn").click( async function() {
                        window.activeInstance.withdraw(window.activeAccount, node.id);
                    }).show();
                } else if (node.state == "APPROVED" && root.address == window.activeAccount) {
                    $("#collectFeeBtn").click( async function() {
                        window.activeInstance.withdraw(window.activeAccount, node.id);
                    }).show();
                }
            } else {
                $("#collectFeeBtn").hide();
                $("#newSubproject").hide();
            }
        });

        // Add apply button if state is open
        if (node.state == 'OPEN') {
            $('#applyToSubprojectBtn').show().click( function() {
                window.activeNode = node.id;
                window.App.saveActiveNode();
                window.location.href = '/apply_node.html';
              });
        } else {
            $('#applyToSubprojectBtn').hide();
        }

        // Scan subprojects and candidates
        window.NodeDetailsController.scanSubprojects(nodeId);
        window.NodeDetailsController.scanCandidates(nodeId);
    },

    init: async function () {
        window.App.waitThenShow("#nodeDetailsFrame", async function() {
            // Load the name and the stake of the active node   
            var nodeId = window.App.loadActiveNode();
            var node = await window.activeInstance.getNodeWeb(nodeId);
            $("#selectedProject").text(node.name);
            $("#ownerAddress").text(node.address);
            $("#totalStake").text(web3.fromWei(node.totalStakeInWei, "ether"));
            // Get the parent
            if (node.id == 0) {
                $("#parentBtn").hide();
                $("#parent").text("-");
            } else {
                var parentNode = await window.activeInstance.getNodeWeb(node.parentId);
                $("#parentBtn").text(parentNode.name).click( function() {
                    window.activeNode = node.parentId;
                    window.App.saveActiveNode();
                    window.location.href = '/node_details.html';
                });
            }

            // Add project overview button
            var root = await window.activeInstance.getNodeWeb(0);
            $("#contractBtn").text(root.name).click( function() {
                window.App.saveActiveInstance();
                window.location.href = '/project_details.html';
            });

            await window.NodeDetailsController.updateState(nodeId);

            // Reload direct subprojects on new node addition
            window.activeInstance.setAddNodeCallback(async function (error, result) {
                if (!error) {
                    window.NodeDetailsController.scanSubprojects(nodeId);
                }
            });
            window.activeInstance.setAddCandidateCallback(async function (error, result) {
                if (!error) {
                    window.NodeDetailsController.scanCandidates(nodeId);
                }
            });
        });
    }
};

window.addEventListener('load', async function () {
    await window.App.start();
    await window.NodeDetailsController.init();
    window.activeInstance.setApproveCandidateCallback(async function (error, result) {
        if (!error) {
            window.NodeDetailsController.updateState();
        }
    });
    window.activeInstance.setCompletedNodeCallback(async function (error, result) {
        if (!error) {
            window.NodeDetailsController.updateState();
        }
    });
});