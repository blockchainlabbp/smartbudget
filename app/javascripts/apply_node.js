var app = require("./app");

window.ApplyNodeController = {
    init: async function () {
        window.App.waitThenShow("#applyNodeFrame", async function() {
            // Load the name and the stake of the active node   
            var nodeId = window.App.loadActiveNode();
            var node = await window.activeInstance.getNodeWeb(nodeId);
            $("#nodeBtn").text(node.name).click( function() {
                window.activeNode = nodeId;
                window.App.saveActiveNode();
                window.location.href = '/node_details.html';
            });
            $("#ownerAddress").text(node.address);
            // Get the parent's details
            var parentNode = await window.activeInstance.getNodeWeb(node.parentId);
            $("#parentBtn").text(parentNode.name).click( function() {
                window.activeNode = parentNode.id;
                window.App.saveActiveNode();
                window.location.href = '/node_details.html';
            });
            $("#totalStake").text(web3.fromWei(parentNode.totalStakeInWei, "ether"));
            $("#availStake").text(web3.fromWei(parentNode.stakeInWei, "ether"));

            // Set the button callback
            $("#btnNewCandidate").click(async function() {
                var name = $("#candidateName").val();
                var stakeInWei = web3.toWei($("#candidateStake").val(), "ether");
                var newId = await window.activeInstance.applyForNode(window.activeAccount, nodeId, name, stakeInWei);
                $("#btnDiv").append(` <button id='candidate${newId}' type='button' class='button candidate'>View candidate ${name}</button>`);
                $(`#candidate${newId}`).click( function() {
                    window.activeCandidate = newId;
                    window.App.saveActiveCandidate();
                    window.location.href = '/candidate_details.html';
                });
            });
        });
    }
};

window.addEventListener('load', async function () {
    await window.App.start();
    await window.ApplyNodeController.init();
    window.activeInstance.setAddCandidateCallback(async function (error, result) {
        if (!error) {
            window.ApplyNodeController.init();
        }
    });
});