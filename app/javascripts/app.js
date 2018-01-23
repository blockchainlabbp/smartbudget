// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import fancytree https://github.com/mar10/fancytree/wiki
import 'jquery.fancytree/dist/skin-lion/ui.fancytree.less';
import {createTree} from 'jquery.fancytree';
import 'jquery.fancytree/dist/modules/jquery.fancytree.edit';
import 'jquery.fancytree/dist/modules/jquery.fancytree.filter';  
import 'jquery.fancytree/dist/modules/jquery.fancytree.table';
import 'jquery.fancytree/dist/modules/jquery.fancytree.gridnav';

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import datastruct_artifacts from '../../build/contracts/DataStructure.json'

// DataStructure is our usable abstraction, which we'll use through the code below.
var DataStructure = contract(datastruct_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

window.SmartBudgetService = {
  init: function(contractAddress) {
    var self = this;
    self.contractAddress = contractAddress;
  },

  getInvestor: function() {
    // TODO: get timelock info, fund amount
  },

  getContractors: function() {
    // TODO: get contractor addresses, allocated funds
    return [
      {name: "Build a house", id: 0, price: 100, address: "0123456789", children: [
        {name: "groundwork", id: 1, price: 10, address: "1123456789", children: []},
        {name: "walls", id: 2, price: 15, address: null, children: []},
        {name: "doors and windows", id: 3, price: 10, address: null, children: []},
        {name: "insulation", id: 4, price: 15, address: null, children: []},
        {name: "painting", id: 5, price: 10, address: null, children: []},
        {name: "machinery", id: 6, price: 20, address: null, children: []}
      ] }
    ]
  },

  createContractor: function(fund, address) {
    // TODO: create a new contractor node in the smart contract
  },

  assignAddress: function(address) {
    // TODO: assign an ethereum address for the contractor node
  },

  deleteContractor: function(id) {

  }
}

window.App = {
  start: function() {
    var self = this;

<<<<<<< HEAD
    // Bootstrap the DataStructure abstraction for Use.
    DataStructure.setProvider(web3.currentProvider);
=======
    self.renderContracts();

    // Bootstrap the MetaCoin abstraction for Use.
    MetaCoin.setProvider(web3.currentProvider);
>>>>>>> a1c84dbb0e3dd1cd136ab3f3a20875069c4f7231

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
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  setError: function(message) {
    var status = document.getElementById("error");
    status.innerHTML = message;
  },


  addRoot: function() {
    var self = this;
    var meta;

    var stake = document.getElementById('stake_input').value;
    var desc = document.getElementById('desc_input').value;

    DataStructure.deployed().then(function(instance) {
      meta = instance;
      return meta.addRoot.sendTransaction(stake, desc, {from: account, gas:600000});
    }).then(function(value) {
      self.setStatus("Tx: " + value.valueOf());
    }).catch(function(e) {
      console.log(e);
      self.setError("Error addRoot: </br>" + e);
    });
  }, 

  addChild: function() {
    var self = this;
    var meta;

    var stake = document.getElementById('child_stake_input').value;
    var desc = document.getElementById('child_desc_input').value;
    var parentid = document.getElementById('child_parentid_select').value;

    DataStructure.deployed().then(function(instance) {
      meta = instance;
      return meta.addChild.sendTransaction(stake, desc, parentid, {from: account, gas:300000});
    }).then(function(value) {
      self.setStatus("Tx: " + value.valueOf());
    }).catch(function(e) {
      console.log(e);
      self.setError("Error addRoot: </br>" + e);
    });
  }, 

  getNodes: function() {
    var self = this;
    var meta;

    DataStructure.deployed().then(function(instance) {
      meta = instance;
      return meta.getNodes.call({from: account, gas:500000});
    }).then(function(value) {

      var table = document.getElementById("nodes_table");

      for(var i = 0; i < value[0].length; i++){
        var row = table.insertRow(1);
        var cell0 = row.insertCell(0);
        var cell1 = row.insertCell(1);
        var cell2 = row.insertCell(2);
  
        cell0.innerHTML = value[0][i];
        cell1.innerHTML = value[1][i];
        cell2.innerHTML = value[2][i];
      }
    }).catch(function(e) {
      console.log(e);
      self.setError("Error getNodes: </br>" + e);
    });
  },

  getNodeDesc: function() {
    var self = this;
    var meta;

    DataStructure.deployed().then(function(instance) {
      meta = instance;
      return meta.getNodeDesc.call(0, {from: account, gas:300000});
    }).then(function(value) {
      self.setStatus(value.valueOf());
    }).catch(function(e) {
      console.log(e);
      self.setError("Error getNodes: </br>" + e);
    });
  }, 

  getIds: function() {
    var self = this;
    var meta;

    DataStructure.deployed().then(function(instance) {
      meta = instance;
      return meta.getIds.call({from: account, gas:300000});
    }).then(function(value) {
      var select = document.getElementById("child_parentid_select");

      select.options.length = 0;

      for(var i = 0; i < value[0].length; i++) {
        var opt = document.createElement("option");
        opt.value = value[i];
        opt.textContent = value[i];
        select.appendChild(opt);
      }
      
    }).catch(function(e) {
      console.log(e);
      self.setError("Error getIds: </br>" + e);
    });
  },

  renderContracts: function() {
    SmartBudgetService.init("0123456789");
    const contractors = SmartBudgetService.getContractors();

    function smartNodeToTreeNodeMapper(smartNode) {
      return {
        title: smartNode.name,
        key: smartNode.id,
        price: smartNode.price,
        address: smartNode.address,
        children: smartNode.children.map(smartNodeToTreeNodeMapper)
      };
    }

    const source = contractors.map(smartNodeToTreeNodeMapper);
    
    var tree = createTree("#tree",{
      checkbox: false,           // don't render default checkbox column
      titlesTabbable: true,        // Add all node titles to TAB chain
      source: source,
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
        $tdList.eq(3).text(node.data.price);
        $tdList.eq(4).append("<button type='button'>Assign</button>");
        $tdList.eq(4).append("<button type='button'>Add</button>");
        $tdList.eq(4).append("<button type='button'>Remove</button>");
      }
    });

    
  }

};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
  }

  App.start();
});
