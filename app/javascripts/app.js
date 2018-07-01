// --------------- Main js app, app page-specific js files should require this first! ------------------
// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";
import "../stylesheets/main.css";
import {SmartBudgetService} from "./smartbudgetservice.js";

// Import fancytree https://github.com/mar10/fancytree/wiki
import 'jquery.fancytree/dist/skin-lion/ui.fancytree.less';
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
window.activeVersion;  // The version of the SmartBudget solidity code
window.activeNetwork;  // The name of the active network (Mainnet, Ropsten, etc.) /type: string
window.activeAccount;  // The metamask account currently in use /type: address
window.activeNode;     // The node currently in use /type: uint
window.activeCandidate;     // The node currently in use /type: uint
window.contractAddresses; // The list of found contract addresses /type: list(address)
window.activeInstance;   // The currently active contract instance /type: SmartBudgetInstance 
window.SmartBudgetService;

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

      window.activeAccount = accs[0];
      $('#metamaskAddress').html(window.activeAccount);
      resolve(window.activeAccount);
    });
  });   
};

function setSidebar() {
   $('#sidebar').html(`
      <div class="inner">
        <!-- Search -->
          <section id="search" class="alt">					
          <a href="#" class="image"><img id="metamask3img" alt="" width="200" class="limage"/></a>
        </section>
        <!-- Menu -->
        <nav id="menu">
        <header class="major">
          <h2>MENU</h2>
        </header>
          <ul>
            <li><a href="index.html">My projects</a></li>
            <li><a href="create_project.html">Create new project</a></li>
            <li><a href="find.html">Find project</a></li>
            <li><a href="about.html">About Us</a></li>      
          </ul>
        </nav>
        <!-- Contact -->
        <section>
          <header class="major">
            <h2>CONTACT</h2>
          </header>
          <ul class="contact">
            <li class="fa-envelope-o"><a href="#">info@blokklancmuhely.hu</a></li>
          </ul>
        </section>
        <!-- Footer -->
        <footer id="footer">
          <img id="logo2Img" alt="" width="200" class="limage"/></a>
            <p class="copyright">&copy; 2018. All rights reserved.<a href="https://blokklancmuhely.club/" target="_blank"> Blokklánc Műhely</a></p>
        </footer>
      </div>`);
};

window.App = {
  start: async function() {
    // Set the menu
    setSidebar();

    // Set the version we'll be using
    window.activeVersion = 1;

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    window.App.checkMetaMask();

    // Set polling of account changes
    checkActiveAccount();
    setInterval(checkActiveAccount, 2000);

    // Configure SmartBudgetService
    SmartBudgetContract.setProvider(web3.currentProvider);
    window.SmartBudgetService = SmartBudgetService.init(SmartBudgetContract);

    // Check if we have already an activeInstance, node and contractor
    await window.App.loadActiveInstance();
  },

  onAccountChange: async function(callback) {
    // First run once
    await callback();
    // Then schedule
    setInterval(async function() {
      if (window.lastActiveAccount != window.activeAccount) {
        window.lastActiveAccount = window.activeAccount;
        await callback();
      }
    }, 2000);
  },

  checkMetaMask: function() {
    if (typeof web3 !== 'undefined') {
      window.web3 = new Web3(web3.currentProvider);
      web3.version.getNetwork((err, netId) => {
        switch (netId) {
          case "1":
            window.activeNetwork = "Main";
            break;
          case "2":
            window.activeNetwork = "Morden";
            break;
          case "3":
            window.activeNetwork = "Ropsten";
            break;
          case "4":
            window.activeNetwork = "Rinkeby";
            break;
          case "42":
            window.activeNetwork = "Kovan";
            break;
          default:
            window.activeNetwork = "Unknown";
        };
        console.log("Detected network: " + activeNetwork);
      });
    } else {
      alert("No injected web3 instance detected! Please install/reinstall MetaMask and reload the page!");
    } 
  },

  loadActiveInstance: async function() {
    if (typeof window.activeInstance == 'undefined') {
      var lastActiveInstanceAddress = getCookie('activeInstanceAddress');
      if (lastActiveInstanceAddress != "") {
        try {
          window.activeInstance = await SmartBudgetService.fromAddress(lastActiveInstanceAddress);
          console.log(`Loaded active instance from cookie at address ${lastActiveInstanceAddress}`); 
        } catch (error) {
          // Probably the address that we saved was on a different network, and is invalid. Set the cookie to empty
          setCookie('activeInstanceAddress',"");
          console.log(`The stored cookie contained an invalid address, removing it`); 
        }
      } else {
        console.log("Could not find valid cookie with name activeInstanceAddress!");
      }
    }
  },

  loadActive: function(cookieName) {
    if (typeof target == 'undefined') {
      var lastValue = getCookie(cookieName);
      if (lastValue != "") {
        console.log(`Loaded ${cookieName}: ${lastValue}`); 
        return lastValue;
      } else {
        console.log(`Could not find valid cookie with name ${cookieName}!`);
      }
    }
  },

  loadActiveNode: function() {
    return window.App.loadActive('activeNode');
  },

  loadActiveCandidate: function() {
    return window.App.loadActive('activeCandidate');
  },

  saveActiveInstance: function () {
    if (typeof window.activeInstance == 'undefined') {
      console.error("Cannot save active instance, as it is still undefined!");
    } else {
      setCookie('activeInstanceAddress', window.activeInstance.instance.address);
      console.log(`Saved active instance with address ${window.activeInstance.instance.address}`);
    }
  },

  saveActive: function(cookieName, value) {
    if (typeof value == 'undefined') {
      console.error(`Cannot save value to ${cookieName}, as it is undefined`);
    } else {
      setCookie(cookieName, value);
      console.log(`Saved cookie ${cookieName} with value ${value}`);
    }
  },

  saveActiveInstanceAddress: function (address) {
    window.App.saveActive('activeInstanceAddress', address);
  },

  saveActiveNode: function () {
    window.App.saveActive('activeNode', window.activeNode);
  },

  saveActiveCandidate: function () {
    window.App.saveActive('activeCandidate', window.activeCandidate);
  },

  formatDate: function (date) {
    return date.getFullYear() + "-" + ("0"+(date.getMonth()+1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) +
     " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2);
  }
};

// ----------------------------------- Cookie management ---------------------------------------------
function setCookie(cname, cvalue, exdays=10) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
          c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
      }
  }
  return "";
}


