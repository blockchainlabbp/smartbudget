var app = require("./app");
import {createTree, fancyTree} from 'jquery.fancytree';

window.TreeView = {
    createTreeBase : function(id, renderCB, colIdx = null) {
      return createTree(id,{
        checkbox: false,           // don't render default checkbox column
        icon: false,
        titlesTabbable: true,        // Add all node titles to TAB chain
        source: null,
        minExpandLevel: 1,
        extensions: ["table"],
        clickFolderMode: 4,
        selectMode: 1,
        table: {
          checkboxColumnIdx: colIdx,    // render the checkboxes into the this column index (default: nodeColumnIdx)
          indentation: 16,         // indent every node level by 16px
          nodeColumnIdx: colIdx         // render node expander, icon, and title to this column (default: #0)
        },
        gridnav: {
          autofocusInput:   false, // Focus first embedded input if node gets activated
          handleCursorKeys: true   // Allow UP/DOWN in inputs to move to prev/next node
        },
      
        //	renderStatusColumns: false,	 
        // false: default renderer
        // true: generate renderColumns events, even for status nodes
        // function: specific callback for status nodes
      
        renderColumns: renderCB
      });
    },
  
    /**
     * Defining the FancyTree object for the root project
     */
    createTreeMyRootProjects : function() {
        TreeView.myRootsTree = TreeView.createTreeBase(
            "#rootTree", 
            function(event, data) {
                var node = data.node;
                var $tdList = $(node.tr).find(">td");
        
                $tdList.eq(0).text(node.data.title);
                $tdList.eq(1).text(node.data.rootAddress.slice(0,10) + "...");
                $tdList.eq(2).text(node.data.state);
                $tdList.eq(3).text(window.App.formatDate(node.data.tenderLT));
                $tdList.eq(4).text(window.App.formatDate(node.data.deliveryLT));
                $tdList.eq(5).text(web3.fromWei(node.data.totalStakeInWei, "ether") + "/" + web3.fromWei(node.data.stakeInWei, "ether"));
                $tdList.eq(6).append("<button type='button' class='button apply'>New subproject</button>").click( function() {
                    window.activeNode = 0;
                    window.App.saveActiveNode();
                    window.location.href = '/create_node.html';
                });
            }, 
        );
    },

    /**
     * Defining the FancyTree object for the nodes
     */
    createTreeNodes : function() {
        TreeView.nodesTree = TreeView.createTreeBase("#projectTree", 
            function(event, data) {
                var node = data.node;
                var $tdList = $(node.tr).find(">td");

                $tdList.eq(0).text(node.data.title);
                $tdList.eq(1).text(node.data.address.slice(0,10) + "...");
                $tdList.eq(2).text(node.data.state);
                $tdList.eq(3).text(web3.fromWei(node.data.totalStakeInWei, "ether") + "/" + web3.fromWei(node.data.stakeInWei, "ether"));
                $tdList.eq(4).append("<button type='button' class='button node'>Details</button>").click( function() {
                    window.activeNode = node.data.id;
                    window.App.saveActiveNode();
                    window.location.href = '/node_details.html';
                });
            },
            0);
    },
  
    updateProject : async function() {
      // How to update data: https://github.com/mar10/fancytree/wiki/TutorialLoadData
      // Load the global details
      var instDataFlat = await window.activeInstance.loadInstanceDataFlat();
      var myRoot = {
        title: instDataFlat.root.name,
        tenderLT: instDataFlat.tenderLT,
        deliveryLT: instDataFlat.deliveryLT,
        state: instDataFlat.state,
        totalStakeInWei: instDataFlat.root.totalStakeInWei,
        stakeInWei: instDataFlat.root.stakeInWei,
        rootAddress: instDataFlat.root.address,
        contractAddress: instDataFlat.address
      }
      TreeView.myRootsTree.reload([myRoot]);

      // Update the title with contract address
      switch (activeNetwork) {
        case "Main":
          $('#contractAddress').append(`<a href='https://etherscan.io/address/${myRoot.contractAddress}'>${myRoot.contractAddress}</a>`);
          break;
        case "Ropsten":
          $('#contractAddress').append(`<a href='https://ropsten.etherscan.io/address/${myRoot.contractAddress}'>${myRoot.contractAddress}</a>`);
          break;
        case "Rinkeby":
        $('#contractAddress').append(`<a href='https://rinkeby.etherscan.io/address/${myRoot.contractAddress}'>${myRoot.contractAddress}</a>`);
          break;
        case "Kovan":
        $('#contractAddress').append(`<a href='https://kovan.etherscan.io/address/${myRoot.contractAddress}'>${myRoot.contractAddress}</a>`);
          break;
        default:
        $('#contractAddress').append(myRoot.contractAddress);
      };

      // Load the project details until 10 levels of depth
      var subTree = await window.activeInstance.getSubTree(0,10);
      // Now we want to exclude the root project, so 
      TreeView.nodesTree.reload(subTree.children);
    }
};
  

window.ProjectDetailsController = {
    init: async function () {
        // Check for valid address
        if (typeof window.activeInstance == 'undefined') {
            alert("No active instance selected! Please select one from your projects.");
            window.location.href = '/index.html';
        }

        // Create tree object
        await window.TreeView.createTreeNodes();
        await window.TreeView.createTreeMyRootProjects();

        // Update the project
        await window.TreeView.updateProject();
    }
};

window.addEventListener('load', async function () {
    await window.App.start();
    await window.ProjectDetailsController.init();
});