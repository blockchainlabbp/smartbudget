var app = require("./app");

window.CandidateDetailsController = {
    init: async function () {
        // Load the name and the stake of the active node   
        var candidateId = window.App.loadActiveCandidate();
        var candidate = await window.activeInstance.getCandidateWeb(candidateId);
        $("#selectedCandidate").append(candidate.name);
        $("#ownerAddress").append(candidate.addr);
        $("#proposedStake").append(web3.fromWei(candidate.stakeInWei, "ether"));
        // Add project overview button
        var root = await window.activeInstance.getNodeWeb(0);
        $("#contractBtn").text(root.name).click( function() {
            window.App.saveActiveInstance();
            window.location.href = '/project_details.html';
          });
        // Approve button
        var nodeId = window.App.loadActiveNode();
        if (nodeId) {
            var node = await window.activeInstance.getNodeWeb(nodeId); 
            // Get the parent
            var parentNode = await window.activeInstance.getNodeWeb(node.parentId);
            if (node.state == "OPEN") {
                $("#candidateScreenTitle").text("Applicant details");             
                // Show the node
                $("#subproject").text(node.name);
                $("#status").text(node.state);
                $("#parentSubproject").text(parentNode.name);
                $("#parentOwner").text(parentNode.address);
                $("#availStake").text(web3.fromWei(parentNode.stakeInWei, "ether"));
                $("#nodeDetails").show();
            }
            window.App.onAccountChange(async function() {
                console.log("Executing");
                if (node.state == "OPEN" && parentNode.address == window.activeAccount) {
                    $(`#backToNode`).hide();
                    $(`#approveCandidate`).text("Approve candidate").show().click( async function() {
                        await window.activeInstance.approveNode(window.activeAccount, nodeId, candidateId);
                        $(`#approveCandidate`).hide();
                        $(`#backToNode`).text(`Back to subproject ${node.name}`).show().click( function() {
                            window.location.href = '/node_details.html';
                        });
                    });
                } else {
                    $(`#approveCandidate`).hide()
                    $(`#backToNode`).text(`Back to subproject ${node.name}`).show().click( function() {
                        window.location.href = '/node_details.html';
                    });
                }
            });
        }
    }
};

window.addEventListener('load', async function () {
    await window.App.start();
    await window.CandidateDetailsController.init();
});