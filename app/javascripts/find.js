var app = require("./app.js");
import {createTree, fancyTree} from 'jquery.fancytree';


window.SearchView = {
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
      SearchView.myRootsTree = SearchView.createTreeBase("#rootTree", function(event, data) {
          var node = data.node;
          var $tdList = $(node.tr).find(">td");
    
          $tdList.eq(0).text(node.data.title);
          $tdList.eq(1).text(node.data.state);
          $tdList.eq(2).text(window.App.formatDate(node.data.tenderLT));
          $tdList.eq(3).text(window.App.formatDate(node.data.deliveryLT));
          $tdList.eq(4).text(web3.fromWei(node.data.totalStakeInWei, "ether") + "/" +web3.fromWei(node.data.stakeInWei, "ether"));
          $tdList.eq(5).append("<button type='button' class='button project'>Project Overview</button>").click( function() {
            window.App.saveActiveInstanceAddress(node.data.address);
            window.location.href = '/project_details.html';
          });
        });
    },
  
    /**
     * Defining the FancyTree object for the nodes
     */
    createTreeNodes : function() {
      SearchView.nodesTree = SearchView.createTreeBase("#subProjectTree", function(event, data) {
          var node = data.node;
          var $tdList = $(node.tr).find(">td");
    
          $tdList.eq(0).text(node.data.title);
          $tdList.eq(1).text(node.data.state);
          $tdList.eq(2).text(web3.fromWei(node.data.totalStakeInWei, "ether") + "/" + web3.fromWei(node.data.stakeInWei, "ether"));
          $tdList.eq(3).append("<button type='button' class='button node'>Subproject details</button>").click( function() {
            window.activeNode = node.data.id;
            window.App.saveActiveNode();
            window.location.href = '/node_details.html';
          });
        });
    },
  
    /**
     * Defining the FancyTree object for the candidates
     */
    createTreeCandidates : function() {
      SearchView.candidatesTree = SearchView.createTreeBase("#candidateTree", function(event, data) {
          var node = data.node;
          var $tdList = $(node.tr).find(">td");
    
          $tdList.eq(0).text(node.data.title);
          $tdList.eq(1).text(web3.fromWei(node.data.stakeInWei, "ether"));
          $tdList.eq(2).append("<button type='button' class='button candidate'>Candidate details</button>").click( function() {
            window.activeCandidate = node.data.id;
            window.App.saveActiveCandidate();
            window.activeNode = '';
            window.App.saveActiveNode();
            window.location.href = '/candidate_details.html';
          });
        });
    },
  
    createTrees: function() {
      SearchView.createTreeMyRootProjects();
      SearchView.createTreeNodes();
      SearchView.createTreeCandidates();
    },
  
    updateTrees : async function(roots, nodes, candidates) {
      // How to update data: https://github.com/mar10/fancytree/wiki/TutorialLoadData
      SearchView.myRootsTree.reload(roots);
      SearchView.nodesTree.reload(nodes);
      SearchView.candidatesTree.reload(candidates);
    }
  };


window.SearchController = {
    init: function () {
        SearchView.createTrees();
        // Set search button callback
        $("#searchBtn").click(async function () {
            var searchType = $("#typeCategory option:selected").val();
            var searchText = $("#searchText").val();
            var nodeStatus = $("#statusCategory option:selected").val();
            window.SearchController.scanProjects(searchType, searchText, nodeStatus);
        });
        // We need to make the status selector visible is we're searching for a subproject
        $("#typeCategory").change(function () {
           if ($("#typeCategory option:selected").val() == 'Subproject') {
             $("#nodeStatus").show();
           } else {
             $("#nodeStatus").hide();
           }
        });
    },

    /**
   * Filters my root nodes. Return a one-element array if it is my root, and an empty array if not
   */
  filterInstances: async function(instDataFlat, searchText) {
    function root2TreeInst(instDataFlat) {
      return {
        title: instDataFlat.root.name,
        tenderLT: instDataFlat.tenderLT,
        deliveryLT: instDataFlat.deliveryLT,
        state: instDataFlat.state,
        totalStakeInWei: instDataFlat.root.totalStakeInWei,
        stakeInWei: instDataFlat.root.stakeInWei,
        address: instDataFlat.address,
      };
    }

    if (searchText == "" && instDataFlat.root.title.toLowerCase().includes(searchText.toLowerCase())) {
      return [root2TreeInst(instDataFlat)];
    } else {
      return [];
    }
  },

  /**
   * Returns an array of nodes owner by me. Returns an empty array if none of the nodes belong to me.
   */
  filterNodes: async function(instDataFlat, searchText, status) {
    return instDataFlat.nodes.filter((node) => {
        if (status == "") {
            return (node.name.toLowerCase().includes(searchText.toLowerCase()) && node.id > 0);
        } else {
            return (node.name.toLowerCase().includes(searchText.toLowerCase()) && node.state == status && node.id > 0);
        }
    });
  },

  /**
   * Return the array of candidates owned by me. Returns an empty array if none of the candidates belong to me.
   */
  filterCandidates: async function(instDataFlat, searchText) {
    return instDataFlat.candidates.filter((cand) => {
      if (searchText == "") {
        return true
      } else {
        return cand.name.toLowerCase().includes(searchText.toLowerCase());
      }
    });
  },

  /**
   * Scans through all contract instances and find the instances, nodes and candidates owned by
   * the active account
   */
  scanProjects: async function(searchType, searchText, nodeStatus) {
    var foundRoots = [];
    var foundNodes = [];
    var foundCandidates = [];
    await window.SearchView.updateTrees(foundRoots, foundNodes, foundCandidates);   
    console.log("Loading my projects, nodes and candidates...");
    
    var addresses = await SmartBudgetService.findAllInstances(window.activeVersion);
    console.log("Addresses: " + addresses);
    // For loop notation that can handle async calls   
    for (const address of addresses) {
        console.log("Scanning instace at address " + address);
        var inst = await SmartBudgetService.fromAddress(address);
        var instDataFlat = await inst.loadInstanceDataFlat();
        if (searchType == "Project") {
            foundRoots = foundRoots.concat(await window.SearchController.filterInstances(instDataFlat, searchText));
            $("#foundProjects").show();
            $("#foundSubprojects").hide();
            $("#foundCandidates").hide();
        } else if (searchType == "Subproject") {
            foundNodes = foundNodes.concat(await window.SearchController.filterNodes(instDataFlat, searchText, nodeStatus));
            $("#foundProjects").hide();
            $("#foundSubprojects").show();
            $("#foundCandidates").hide();
        } else {
            foundCandidates = foundCandidates.concat(await window.SearchController.filterCandidates(instDataFlat, searchText));
            $("#foundProjects").hide();
            $("#foundSubprojects").hide();
            $("#foundCandidates").show();
        }
        // Update the trees in each round   
        await window.SearchView.updateTrees(foundRoots, foundNodes, foundCandidates);   
    }
  }
};

window.addEventListener('load', function() {
    window.App.start();
    window.SearchController.init();
});

