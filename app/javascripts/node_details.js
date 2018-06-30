var app = require("./app");

window.NodeDetailsController = {
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
        // Get the parent
        if (node.id == 0) {
            $("#parent").append("-");
        } else {
            var parentNode = await window.activeInstance.getNodeWeb(node.parentId);
            $("#parent").append(`<button type='button'>${parentNode.name}</button>`).click( function() {
                window.activeNode = node.parentId;
                window.App.saveActiveNode();
                window.location.href = '/node_details.html';
              });;
        }
        // Add new subproject button if owner
        if (node.address == window.activeAccount) {
            $("#subprojects").append("<button type='button'>Add new subproject</button>").click( function() {
                window.activeNode = node.id;
                window.App.saveActiveNode();
                window.location.href = '/create_node.html';
            });
        }

        // Parse subprojects


        // Add apply button if state is open
        if (node.state == 'OPEN') {
            $('#candidates').append("<button id='applyToNode' type='button'>Apply to subproject</button>")
            $('#applyToNode').click( function() {
                window.activeNode = node.id;
                window.App.saveActiveNode();
                window.location.href = '/apply_node.html';
              });
        }

        console.log(node);
        // Parse candidates
        await Promise.all(node.candidateIds.map( async (candidateId) => {
            var candidate = await window.activeInstance.getCandidateWeb(candidateId);
            $('#candidates').append(` <button id='candidate${candidateId}' type='button'>${candidate.name}, stake: ${web3.fromWei(candidate.stakeInWei, "ether")}</button>`);
            $(`#candidate${candidateId}`).click( function() {
                window.activeCandidate = candidateId;
                window.App.saveActiveCandidate();
                window.activeNode = node.id;
                window.App.saveActiveNode();
                window.location.href = '/candidate_details.html';
              });
        }));


    }
};

window.addEventListener('load', async function () {
    await window.App.start();
    await window.NodeDetailsController.init();
});