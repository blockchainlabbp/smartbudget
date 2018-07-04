var app = require("./app");

window.CandidateDetailsController = {
    init: async function () {
        // Load the name and the stake of the active node   
        var candidateId = window.App.loadActiveCandidate();
        var candidate = await window.activeInstance.getCandidateWeb(candidateId);
        $("#selectedCandidate").append(candidate.name);
        $("#ownerAddress").append(candidate.addr);
        $("#proposedStake").append(web3.fromWei(candidate.stakeInWei, "ether"));
        // Approve button
        var nodeId = window.App.loadActiveNode();
        if (nodeId) { 
            // Update title
            $("#candidateScreenTitle").text("Applicant details");
            var node = await window.activeInstance.getNodeWeb(nodeId);
            // Get the parent
            var parentNode = await window.activeInstance.getNodeWeb(node.parentId);
            // Show the node
            $("#subproject").text(node.name);
            $("#parentSubproject").text(parentNode.name);
            $("#parentOwner").text(parentNode.address);
            $("#availStake").text(web3.fromWei(parentNode.stakeInWei, "ether"));
            $("#nodeDetails").show();
            window.App.onAccountChange(async function() {
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