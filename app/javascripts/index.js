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

window.lastActiveAccount;

/**
 * Tree rendering
 */
window.TreeView = {

  /**
   * Defining the FancyTree object
   */
  createTree : function() {
    TreeView.tree = createTree("#tree",{
      checkbox: false,           // don't render default checkbox column
      icon: false,
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
        $tdList.eq(0).text(node.data.title);
        $tdList.eq(1).text(node.data.address);
        $tdList.eq(2).text(node.data.stake);

        $tdList.eq(3).append("<button type='button'>Project Overview</button>")
      }
    });
  },

  updateTree : async function(contractors) {
    // How to update data: https://github.com/mar10/fancytree/wiki/TutorialLoadData
    TreeView.tree.reload(contractors);
  }
};

/**
 * Control flow
 * client side validation
 */
window.Controller = {
  init : async function() {
    TreeView.createTree();
  },

  findMyInstances: async function() {
    // Find all instance addresses
    var addresses = await SmartBudgetService.findAllInstances();
    // Load all of them
    var instancesAndRoots = await Promise.all(addresses.map( async (addr) => {
      var inst = await SmartBudgetService.fromAddress(addr);
      var rootNode = await inst.getNodeWeb(0);
      return {instance: inst, root: rootNode};
    }));
    // Find the relevant ones
    var myInstancesAndRoots = instancesAndRoots.filter( (instAndRoot) => {
      return instAndRoot.root.address == activeAccount;
    });
    return myInstancesAndRoots;
  },

  findMyRootProjects: async function() {
    var myInstancesAndRoots = await window.Controller.findMyInstances();

    function smartNodeToTreeNodeMapper(smartNode) { 
      return {
        id: smartNode.id,
        title: smartNode.name,
        key: smartNode.id,
        stake: web3.fromWei(smartNode.stakeInWei, "ether"),
        address: smartNode.address,
        parentid: smartNode.parentid,
        children: []
      };
    }

    var myTreeRoots = myInstancesAndRoots.map( (instAndRoot) => smartNodeToTreeNodeMapper(instAndRoot.root) );
    window.TreeView.updateTree(myTreeRoots);
  },

  scanMyRootProjects: async function() {
    if (window.lastActiveAccount != window.activeAccount) {
      console.log("Loading my projects...");
      window.lastActiveAccount = window.activeAccount;
      await window.Controller.findMyRootProjects();
    }
  }
};

window.addEventListener('load', async function() {
  await window.App.start();
  await window.Controller.init();
  await window.Controller.scanMyRootProjects();
  setInterval(window.Controller.scanMyRootProjects, 2000);
});

