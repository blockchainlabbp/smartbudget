var app = require("./app");

window.CreateNodeController = {
    init: async function () {
        // Load the name and the stake of the active node   
        var nodeId = window.App.loadActiveNode();
        var node = await window.activeInstance.getNodeWeb(nodeId);
        $("#selectedProject").append(node.name);
        $("#ownerAddress").append(node.address);
        var state;
        if (node.id == 0) {
            state = "ROOT";
        } else {
            state = node.state;
        }
        $("#nodeStatus").append(state);
        $("#availStake").append(web3.fromWei(node.stakeInWei, "ether"));
        // Verify that we are indeed owners of the node
        if (node.address != window.activeAccount) {
            alert("Your selected metamask address is not the owner of the parent node! You cannot edit this node");
            window.location.href = '/project_details.html';
        }
        // Set the button callback
        $("#btnNewSubproject").click(function() {
            var desc = $("#subprojectName").val();
            window.activeInstance.addNode(window.activeAccount, desc, nodeId);
        });
    }
};

window.addEventListener('load', async function () {
    await window.App.start();
    await window.CreateNodeController.init();
});