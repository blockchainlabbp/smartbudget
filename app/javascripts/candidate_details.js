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
        var node = await window.activeInstance.getNodeWeb(nodeId);
        // Get the parent
        var parentNode = await window.activeInstance.getNodeWeb(node.parentId);
        console.log(parentNode);
        if (parentNode.address == window.activeAccount) {
            console.log("I'm here");
            $('#actions').append(`<button id='approveCandidate' type='button'>Approve candidate</button>`);
            $(`#approveCandidate`).click( function() {
                window.activeInstance.approveNode(window.activeAccount, nodeId, candidateId);
              });
        }
    }
};

window.addEventListener('load', async function () {
    await window.App.start();
    await window.CandidateDetailsController.init();
});