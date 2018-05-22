// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";
import "../stylesheets/main.css";
import {SmartBudgetService} from "./smartbudgetservice.js";

// Import fancytree https://github.com/mar10/fancytree/wiki
import 'jquery.fancytree/dist/skin-lion/ui.fancytree.less';
import {createTree, fancyTree} from 'jquery.fancytree';
import 'jquery.fancytree/dist/modules/jquery.fancytree.edit';
import 'jquery.fancytree/dist/modules/jquery.fancytree.filter';  
import 'jquery.fancytree/dist/modules/jquery.fancytree.table';
import 'jquery.fancytree/dist/modules/jquery.fancytree.gridnav';

import 'jquery-ui/ui/widgets/dialog';
import 'jquery-ui/themes/base/all.css';

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

import logoData from '../images/logo.png';
import logo2Data from '../images/logo2.png';
import metamask3Data from '../images/metamask3.png';
import pic01Data from '../images/pic01.jpg';
import pic11Data from '../images/pic01.jpg';
$('#logoImg').attr('src', logoData);
$('#logo2Img').attr('src', logo2Data);
$('#metamask3Img').attr('src', metamask3Data);
$('#pic01Img').attr('src', pic01Data);
$('#pic11Img').attr('src', pic11Data);

// Smartbudget imports
import smartbudget_abi from '../../build/contracts/SmartBudget.json'
var SmartBudgetContract = contract(smartbudget_abi);

// In this simple setting, we're using globals to deal with concept of "selected account in metamask"
// and "selected contract"
var activeAccount;  // The metamask account currently in use /type: address
var contractAddresses; // The list of found contract addresses /type: list(address)
var activeInstance;   // The currently active contract instance /type: SmartBudgetInstance 

function checkActiveAccount() {
  return new Promise(function (resolve, reject) {
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        reject("Could not get any accounts");
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Please log in to your metamask account first, then click 'OK' to start!");
        reject("Could not get any accounts");
      }

      activeAccount = accs[0];
      $('#metamaskAddress').html(activeAccount);
      resolve(activeAccount);
    });
  });   
};

window.App = {
  start: function() {
    var self = this;

    // Set polling of account changes
    setInterval( checkActiveAccount, 2000);
    // Configure SmartBudgetService
    SmartBudgetContract.setProvider(web3.currentProvider);
    SmartBudgetService.init(SmartBudgetContract);

    // Init the treeview
    window.Controller.init();
    
    // Use async block so that we can use await notation
    (async () => { 
      // Check active account
      await checkActiveAccount();

      // Find all past instances
      contractAddresses = await SmartBudgetService.findAllInstances();
      if (contractAddresses.length == 0) {
        alert("No contract instance deployed yet! Please start with deploying a new instance!");
      } else {        
        activeInstance = await SmartBudgetService.fromAddress(contractAddresses[0]);
        // Set addNode callback
        activeInstance.setAddNodeCallback(window.Controller.updateTree);
        console.log("Found contract address(es), will use first: " + JSON.stringify(contractAddresses));
      }
    })();
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  }
};

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

  deployContract: function() {
    SmartBudgetService.create(1000000, 1, 2000000, 1, "NewInstance", 0.00005, activeAccount);
  },

  addContractor: function(parentId, desc) {
    activeInstance.addNode(activeAccount, desc, parentId)
    .catch((reason) => console.log(reason));
  },
  
  applyForProject: function(nodeId, name, stake) {
    activeInstance.applyForNode(activeAccount, nodeId, name, stake)
    .catch((reason) => console.log(reason));
  },
  
  approveProject: function(nodeId) {
    activeInstance.approveNode(activeAccount, nodeId, 0)
    .catch((reason) => console.log(reason));
  },

  updateTree : function() {
    $("#msgBlockChanged").hide();

    function smartNodeToTreeNodeMapper(smartNode) { 
      
      return {
        id: smartNode.id,
        title: smartNode.name,
        key: smartNode.id,
        stake: smartNode.stake,
        address: smartNode.address,
        parentid: smartNode.parentid,
        children: smartNode.children.map(smartNodeToTreeNodeMapper)
      };
    }

    activeInstance.getSubTree(0, 10)
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
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
  }

  App.start();
});