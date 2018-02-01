// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";
import {SmartBudgetService} from "./smartbudgetservice.js";

// Import fancytree https://github.com/mar10/fancytree/wiki
import 'jquery.fancytree/dist/skin-lion/ui.fancytree.less';
import {createTree, fancyTree} from 'jquery.fancytree';
import 'jquery.fancytree/dist/modules/jquery.fancytree.edit';
import 'jquery.fancytree/dist/modules/jquery.fancytree.filter';  
import 'jquery.fancytree/dist/modules/jquery.fancytree.table';
import 'jquery.fancytree/dist/modules/jquery.fancytree.gridnav';

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Smartbudget imports
import smartbudget_abi from '../../build/contracts/SmartBudget.json'
var SmartBudgetContract = contract(smartbudget_abi);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

window.App = {
  start: function() {
    var self = this;

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];
    });

    // Bootstrap the smart contract
    SmartBudgetContract.setProvider(web3.currentProvider);
    SmartBudgetService.init(SmartBudgetContract, account);

    window.Controller.init();
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

    TreeView.tree = createTree("#tree",{
      checkbox: false,           // don't render default checkbox column
      titlesTabbable: true,        // Add all node titles to TAB chain
      source: null,
      extensions: ["table", "gridnav"],
      table: {
        checkboxColumnIdx: null,    // render the checkboxes into the this column index (default: nodeColumnIdx)
        indentation: 16,         // indent every node level by 16px
        nodeColumnIdx: 1         // render node expander, icon, and title to this column (default: #0)
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
        $tdList.eq(2).text(node.data.address);
        $tdList.eq(3).text(node.data.stake);
        $tdList.eq(4).append("<button type='button'>Assign</button>");
        $tdList.eq(4).append("<button type='button'>Add</button>");
        $tdList.eq(4).append("<button type='button'>Remove</button>");
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

  updateTree : function() {

    function smartNodeToTreeNodeMapper(smartNode) {
      return {
        title: smartNode.name,
        key: smartNode.id,
        stake: smartNode.stake,
        address: smartNode.address,
        children: smartNode.children.map(smartNodeToTreeNodeMapper)
      };
    }

    const contractors = SmartBudgetService.getContractors()
    .then((val) => val.map(smartNodeToTreeNodeMapper))
    .then((val) => window.TreeView.updateTree(val))
    .catch((reason) => console.log(reason));
    
  }
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"));
  }

  App.start();
});