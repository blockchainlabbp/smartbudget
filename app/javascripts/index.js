// Import the page's CSS. Webpack will know what to do with it.
var app = require("./app.js");
import {createTree, fancyTree} from 'jquery.fancytree';

/**
 * 
 * View: 
 * <li>HTML and DOM manipulation</li>
 * <li>assigns event listeners from controller to DOM</li>
 * <li>knows about Controller</li>
 * 
 * Controller: 
 * <li>event callbacks from view</li>
 * <li>call to service (SmartContract)</li>
 * <li>update view from service return</li>
 * 
 * Service:
 * <li>calling backend service and smart contract</li> * 
 */

/**
 * Tree rendering
 */
window.TreeView = {

  /**
   * Defining the FancyTree object
   */
  createTree : function() {
    $("#btnLoadContracts").click(window.Controller.updateTree);
    $("#btnDeployContract").click(window.Controller.deployContract);
    $("#btnTest").click(window.Controller.findAllInstances);
    $("#detailsDialog").dialog().dialog("close");
    $("#addNode", "#detailsDialog").on("click", function(e) {
        //$(this).append("<span>Node insert pending...</span>");
        if ($("#addNodeDesc", "#detailsDialog")[0].checkValidity()) {
          window.Controller.addContractor(
            $("#nodeID", "#detailsDialog").val(),
            $("#addNodeDesc", "#detailsDialog").val());  
        } else {
          $("#validationError", "#detailsDialog").show();
        }
    });
    $("#applyForNode", "#detailsDialog").on("click", function(e) {
        if ($("#applyForNodeName", "#detailsDialog")[0].checkValidity() && 
            $("#applyForNodeStake", "#detailsDialog")[0].checkValidity()) {
          window.Controller.applyForProject(
            $("#nodeID", "#detailsDialog").val(),
            $("#applyForNodeName", "#detailsDialog").val(),
            $("#applyForNodeStake", "#detailsDialog").val());  
        } else {
          $("#validationError", "#detailsDialog").show();
        }
    });
    $("#approveNode", "#detailsDialog").on("click", function(e) {
        window.Controller.approveProject($("#nodeID", "#detailsDialog").val());
    });

    TreeView.tree = createTree("#tree",{
      checkbox: false,           // don't render default checkbox column
      titlesTabbable: true,        // Add all node titles to TAB chain
      source: null,
      minExpandLevel: 3,
      extensions: ["table", "gridnav"],
      table: {
        checkboxColumnIdx: null,    // render the checkboxes into the this column index (default: nodeColumnIdx)
        indentation: 16,         // indent every node level by 16px
        nodeColumnIdx: null         // render node expander, icon, and title to this column (default: #0)
      },
      gridnav: {
        autofocusInput:   false, // Focus first embedded input if node gets activated
        handleCursorKeys: true   // Allow UP/DOWN in inputs to move to prev/next node
      },
    
      //	renderStatusColumns: false,	 
      // false: default renderer
      // true: generate renderColumns events, even for status nodes
      // function: specific callback for status nodes
    
      renderColumns: function(event, data) {

        var node = data.node;
        var $tdList = $(node.tr).find(">td");
    
        // (Column #0 is rendered by fancytree by adding the checkbox)
        // (Column #1 is rendered by fancytree) adding node name and icons
        
        // ...otherwise render remaining columns
        $tdList.eq(1).text(node.data.title);
        $tdList.eq(2).text(node.data.address);
        $tdList.eq(3).text(node.data.stake);

        $tdList.eq(4).append("<button type='button'>Details</button>")
        .click(function() {
            $("#nodeID", "#detailsDialog").val(node.data.id);
            $("#nodeDetails", "#detailsDialog").html("Project ID: " + node.data.id);
            $("#validationError", "#detailsDialog").hide();
            $("#detailsDialog").dialog("open");
        });
      }
    });
  },

  updateTree : function(contractors) {
    // How to update data: https://github.com/mar10/fancytree/wiki/TutorialLoadData
    TreeView.tree.reload(contractors);
  }
};

/**
 * Control flow
 * client side validation
 */
window.Controller = {
  init : function() {
    TreeView.createTree();
  },

  findAllInstances: async function() {
    // Find all past instances
    window.contractAddresses = await SmartBudgetService.findAllInstances();
    if (window.contractAddresses.length == 0) {
      alert("No contract instance deployed yet! Please start with deploying a new instance!");
    } else {        
      window.activeInstance = await SmartBudgetService.fromAddress(window.contractAddresses[0]);
      window.App.saveActiveInstance();
      // Set addNode callback
      window.activeInstance.setAddNodeCallback(window.Controller.updateTree);
      console.log("Found contract address(es), will use first: " + JSON.stringify(window.contractAddresses));
    }
  },

  // Deploy new contract
  deployContract: function() {
    SmartBudgetService.create(1000000, 1, 2000000, 1, "NewInstance", 0.00005, window.activeAccount);
  },

  tenderLockTime: function() {
    window.activeInstance.secondsToTenderEnd();
  },

  // ----------------------------------- Updaters ---------------------------------------------

  addContractor: function(parentId, desc) {
    window.activeInstance.addNode(window.activeAccount, desc, parentId)
    .catch((reason) => console.log(reason));
  },
  
  applyForProject: function(nodeId, name, stake) {
    window.activeInstance.applyForNode(window.activeAccount, nodeId, name, stake)
    .catch((reason) => console.log(reason));
  },
  
  approveProject: function(nodeId) {
    window.activeInstance.approveNode(window.activeAccount, nodeId, 0)
    .catch((reason) => console.log(reason));
  },

  updateTree : function() {
    $("#msgBlockChanged").hide();

    function smartNodeToTreeNodeMapper(smartNode) { 
      
      return {
        id: smartNode.id,
        title: smartNode.name,
        key: smartNode.id,
        stake: web3.fromWei(smartNode.stakeInWei, "ether"),
        address: smartNode.address,
        parentid: smartNode.parentid,
        children: smartNode.children.map(smartNodeToTreeNodeMapper)
      };
    }

    window.activeInstance.getSubTree(0, 10)
    .then(function (val) {
      return [val].map(smartNodeToTreeNodeMapper);
    }).then((val) => window.TreeView.updateTree(val))
    .catch((reason) => console.log(reason));
  },

  warnBlockChange: function () {
      $("#msgBlockChanged").show();
  }
};

window.addEventListener('load', function() {
  window.App.start();
  window.Controller.init();
});

