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
    TreeView.myRootsTree = createTreeBase("#tree", function(event, data) {
        var node = data.node;
        var $tdList = $(node.tr).find(">td");
  
        $tdList.eq(0).text(node.data.title);
        $tdList.eq(1).text(node.data.state);
        $tdList.eq(2).text(window.App.formatDate(node.data.tenderLT));
        $tdList.eq(3).text(window.App.formatDate(node.data.deliveryLT));
        $tdList.eq(4).text(node.data.stake);
        $tdList.eq(5).append("<button type='button'>Project Overview</button>")
      });
  },

  /**
   * Defining the FancyTree object for the nodes
   */
  createTreeNodes : function() {
    TreeView.nodesTree = createTreeBase("#subProjectTree", function(event, data) {
        var node = data.node;
        var $tdList = $(node.tr).find(">td");
  
        $tdList.eq(0).text(node.data.title);
        $tdList.eq(1).text(node.data.state);
        $tdList.eq(2).text(window.App.formatDate(node.data.tenderLT));
        $tdList.eq(3).text(window.App.formatDate(node.data.deliveryLT));
        $tdList.eq(4).text(node.data.stake);
        $tdList.eq(5).append("<button type='button'>Project Overview</button>")
      });
  },

  /**
   * Defining the FancyTree object for the candidates
   */
  createTreeCandidates : function() {
    TreeView.candidatesTree = createTreeBase("#candidateTree", function(event, data) {
        var node = data.node;
        var $tdList = $(node.tr).find(">td");
  
        $tdList.eq(0).text(node.data.title);
        $tdList.eq(1).text(node.data.state);
        $tdList.eq(2).text(window.App.formatDate(node.data.tenderLT));
        $tdList.eq(3).text(window.App.formatDate(node.data.deliveryLT));
        $tdList.eq(4).text(node.data.stake);
        $tdList.eq(5).append("<button type='button'>Project Overview</button>")
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

  findMyInstances: async function() {
    // Find all instance addresses
    var addresses = await SmartBudgetService.findAllInstances();
    console.log("The found addresses: " + addresses);
    // Load all of them
    var instanceObjs = await Promise.all(addresses.map( async (addr) => {
      var inst = await SmartBudgetService.fromAddress(addr);
      var rootNode = await inst.getNodeWeb(0);
      var tender = await inst.tenderLockTime();
      var delivery = await inst.deliveryLockTime();
      var contractState = await inst.getContractState();
      return {instance: inst, root: rootNode, tenderLT: tender, deliveryLT: delivery, state: contractState};
    }));
    // Find the relevant ones
    var myInstanceObjs = instanceObjs.filter( (instAndRoot) => {
      return instAndRoot.root.address == activeAccount;
    });
    return myInstanceObjs;
  },

  findMyRootProjects: async function() {
    var myInstanceObjs = await window.Controller.findMyInstances();

    function smartNodeToTreeNodeMapper(smartNode, tenderLT, deliveryLT, state) { 
      return {
        id: smartNode.id,
        title: smartNode.name,
        tenderLT: tenderLT,
        deliveryLT: deliveryLT,
        key: smartNode.id,
        state: state,
        stake: web3.fromWei(smartNode.stakeInWei, "ether"),
        address: smartNode.address,
        parentid: smartNode.parentid,
        children: []
      };
    }

    var myTreeRoots = myInstanceObjs.map( (instObj) => 
      smartNodeToTreeNodeMapper(instObj.root, instObj.tenderLT, instObj.deliveryLT, instObj.state) );
    window.TreeView.updateTree(myTreeRoots);
  },

  scanMyRootProjects: async function() {
    if (window.lastActiveAccount != window.activeAccount) {
      console.log("Loading my projects...");
      window.lastActiveAccount = window.activeAccount;
      await window.Controller.findMyRootProjects();
    }
  },

  // --------------------------------------- Find nodes ------------------------------------------------
  filterMyProjects: async function(inst, myAddress) {
    var allNodes = await inst.getNodesFlat();
    var myNodes = [];
    for (var node in myNodes) {
      // Only collect non-root project (id != 0)
      if (node.id > 0 && node.address == myAddress) {
        myNodes.push(node);
      }
    }
  },

  findMyProjects: async function() {
    var myProjects = [];
    // Find all instance addresses
    var addresses = await SmartBudgetService.findAllInstances();
    // find all projects owned by me that are not root projects
    var instanceObjs = await Promise.all(addresses.map( async (addr) => {
      var inst = await SmartBudgetService.fromAddress(addr);
      var proj = await window.Controller.filterMyProjects(inst, activeAccount);
      myProjects = myProjects.concat(proj);
    }));
    console.log("Found the following my non-root projects: " + myProjects);
    return myProjects;
  },

  findMyRootProjects: async function() {
    var myInstanceObjs = await window.Controller.findMyInstances();

    function smartNodeToTreeNodeMapper(smartNode, tenderLT, deliveryLT, state) { 
      return {
        id: smartNode.id,
        title: smartNode.name,
        tenderLT: tenderLT,
        deliveryLT: deliveryLT,
        key: smartNode.id,
        state: state,
        stake: web3.fromWei(smartNode.stakeInWei, "ether"),
        address: smartNode.address,
        parentid: smartNode.parentid,
        children: []
      };
    }

    var myTreeRoots = myInstanceObjs.map( (instObj) => 
      smartNodeToTreeNodeMapper(instObj.root, instObj.tenderLT, instObj.deliveryLT, instObj.state) );
    window.TreeView.updateTree(myTreeRoots);
  },

  scanMyRootProjects: async function() {
    if (window.lastActiveAccount != window.activeAccount) {
      console.log("Loading my projects...");
      window.lastActiveAccount = window.activeAccount;
      await window.Controller.findMyRootProjects();
    }
  },

  // -------------------------------------- Find candidates --------------------------------------------
  findMyInstances: async function() {
    // Find all instance addresses
    var addresses = await SmartBudgetService.findAllInstances();
    console.log("The found addresses: " + addresses);
    // Load all of them
    var instanceObjs = await Promise.all(addresses.map( async (addr) => {
      var inst = await SmartBudgetService.fromAddress(addr);
      var rootNode = await inst.getNodeWeb(0);
      var tender = await inst.tenderLockTime();
      var delivery = await inst.deliveryLockTime();
      var contractState = await inst.getContractState();
      return {instance: inst, root: rootNode, tenderLT: tender, deliveryLT: delivery, state: contractState};
    }));
    // Find the relevant ones
    var myInstanceObjs = instanceObjs.filter( (instAndRoot) => {
      return instAndRoot.root.address == activeAccount;
    });
    return myInstanceObjs;
  },

  findMyRootProjects: async function() {
    var myInstanceObjs = await window.Controller.findMyInstances();

    function smartNodeToTreeNodeMapper(smartNode, tenderLT, deliveryLT, state) { 
      return {
        id: smartNode.id,
        title: smartNode.name,
        tenderLT: tenderLT,
        deliveryLT: deliveryLT,
        key: smartNode.id,
        state: state,
        stake: web3.fromWei(smartNode.stakeInWei, "ether"),
        address: smartNode.address,
        parentid: smartNode.parentid,
        children: []
      };
    }

    var myTreeRoots = myInstanceObjs.map( (instObj) => 
      smartNodeToTreeNodeMapper(instObj.root, instObj.tenderLT, instObj.deliveryLT, instObj.state) );
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

