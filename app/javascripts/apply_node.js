var app = require("./app");

window.ApplyNodeController = {
    init: async function () {
        // Load the name and the stake of the active node   
        var nodeId = window.App.loadActiveNode();
        var node = await window.activeInstance.getNodeWeb(nodeId);
        $("#selectedProject").append(node.name);
        $("#ownerAddress").append(node.address);
        // Get the parent's details
        var parentNode = await window.activeInstance.getNodeWeb(node.parentId);
        $("#parentName").append(parentNode.name);
        $("#availStake").append(web3.fromWei(parentNode.stakeInWei, "ether"));

        // Set the button callback
        $("#btnNewCandidate").click(function() {
            var name = $("#candidateName").val();
            var stakeInWei = web3.toWei($("#candidateStake").val(), "ether");
            window.activeInstance.applyForNode(window.activeAccount, nodeId, name, stakeInWei);
            window.activeNode = nodeId;
            window.App.saveActiveNode();
            window.location.href = '/node_details.html';
        });
    }
};

window.addEventListener('load', async function () {
    await window.App.start();
    await window.ApplyNodeController.init();
});