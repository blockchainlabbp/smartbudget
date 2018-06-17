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
 * Tree rendering - shared logic
 */
window.TreeView = {
  createTreeBase : function(id, renderCB) {
    return createTree(id,{
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
    
      renderColumns: renderCB
    });
  },

  /**
   * Defining the FancyTree object for the root project
   */
  createTreeMyRootProjects : function() {
    TreeView.myRootsTree = TreeView.createTreeBase("#tree", function(event, data) {
        var node = data.node;
        var $tdList = $(node.tr).find(">td");
  
        $tdList.eq(0).text(node.data.title);
        $tdList.eq(1).text(node.data.state);
        $tdList.eq(2).text(window.App.formatDate(node.data.tenderLT));
        $tdList.eq(3).text(window.App.formatDate(node.data.deliveryLT));
        $tdList.eq(4).text(web3.fromWei(node.data.stakeInWei, "ether"));
        $tdList.eq(5).append("<button type='button'>Project Overview</button>")
      });
  },

  /**
   * Defining the FancyTree object for the nodes
   */
  createTreeNodes : function() {
    TreeView.nodesTree = TreeView.createTreeBase("#subProjectTree", function(event, data) {
        var node = data.node;
        var $tdList = $(node.tr).find(">td");
  
        $tdList.eq(0).text(node.data.name);
        $tdList.eq(1).text(node.data.address);
        $tdList.eq(2).text(node.data.state);
        $tdList.eq(3).text(web3.fromWei(node.data.stakeInWei, "ether"));
        $tdList.eq(4).append("<button type='button'>Project Overview</button>")
      });
  },

  /**
   * Defining the FancyTree object for the candidates
   */
  createTreeCandidates : function() {
    TreeView.candidatesTree = TreeView.createTreeBase("#candidateTree", function(event, data) {
        var node = data.node;
        var $tdList = $(node.tr).find(">td");
  
        $tdList.eq(0).text(node.data.name);
        $tdList.eq(1).text(node.data.addr);
        $tdList.eq(2).text(web3.fromWei(node.data.stakeInWei, "ether"));
        $tdList.eq(3).append("<button type='button'>Project Overview</button>")
      });
  },

  createTrees: function() {
    TreeView.createTreeMyRootProjects();
    TreeView.createTreeNodes();
    TreeView.createTreeCandidates();
  },

  updateTrees : async function(roots, nodes, candidates) {
    // How to update data: https://github.com/mar10/fancytree/wiki/TutorialLoadData
    TreeView.myRootsTree.reload(roots);
    TreeView.nodesTree.reload(nodes);
    TreeView.candidatesTree.reload(candidates);
  }
};

/**
 * Control flow
 * client side validation
 */
window.Controller = {
  init : async function() {
    TreeView.createTrees();
  },

  /**
   * Filters my root nodes. Return a one-element array if it is my root, and an empty array if not
   */
  filterMyInstance: async function(instDataFlat) {
    function root2TreeInst(instDataFlat) {
      return {
        title: instDataFlat.root.name,
        tenderLT: instDataFlat.tenderLT,
        deliveryLT: instDataFlat.deliveryLT,
        state: instDataFlat.state,
        stakeInWei: instDataFlat.root.stakeInWei,
        address: instDataFlat.root.address,
      };
    }

    if (instDataFlat.root.address == activeAccount) {
      return [root2TreeInst(instDataFlat)];
    } else {
      return [];
    }
  },

  /**
   * Returns an array of nodes owner by me. Returns an empty array if none of the nodes belong to me.
   */
  filterMyNodes: async function(instDataFlat) {
    var myNodes = [];
    for (var node in instDataFlat.nodes) {
      if (node.address == activeAccount && node.id > 0) {
        myNodes.push(node);
      }
    }
    return myNodes;
  },

  /**
   * Return the array of candidates owned by me. Returns an empty array if none of the candidates belong to me.
   */
  filterMyCandidates: async function(instDataFlat) {
    var myCandidates = [];
    for (var cand in instDataFlat.candidates) {
      if (cand.address == activeAccount) {
        myCandidates.push(cand);
      }
    }
    return myCandidates;
  },

  /**
   * Scans through all contract instances and find the instances, nodes and candidates owned by
   * the active account
   */
  scanProjects: async function() {
    if (window.lastActiveAccount != window.activeAccount) {
      window.lastActiveAccount = window.activeAccount;
      console.log("Loading my projects, nodes and candidates...");
      var myRoots = [];
      var myNodes = [];
      var myCandidates = [];
      var addresses = await SmartBudgetService.findAllInstances();
      // For loop notation that can handle async calls   
      for (const address of addresses) {
        console.log("Scanning instace at address " + address);
        var inst = await SmartBudgetService.fromAddress(address);
        var instDataFlat = await inst.loadInstanceDataFlat();
        myRoots = myRoots.concat(await window.Controller.filterMyInstance(instDataFlat));
        myNodes = myNodes.concat(await window.Controller.filterMyNodes(instDataFlat));
        myCandidates = myCandidates.concat(await window.Controller.filterMyCandidates(instDataFlat));      
      }
      await window.TreeView.updateTrees(myRoots, myNodes, myCandidates);
    }
  }
};

/**
 * Tasks to do on page load
 * Always start with window.App.start(), this is where the shared logic resides
 */
window.addEventListener('load', async function() {
  await window.App.start();
  await window.Controller.init();
  await window.Controller.scanProjects();
  setInterval(window.Controller.scanProjects, 2000);
});

