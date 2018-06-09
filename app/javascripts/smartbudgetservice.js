/**
 * SmartBudgetService: object for finding, loading and creating SmartBudgetInstance,
 * which are convenient wrappers around truffle contract instances
 */
export const SmartBudgetService = {
    _truffleContract: null,

    init: function (truffleContract) {
        var self = this;
        self._truffleContract = truffleContract;
        return self;
    },

    /**
     * Find all SmartBudget instances on the chain
     */
    findAllInstances: function (_fromBlock = 0x0) {
        return new Promise(function (resolve, reject) {
            // Try to load the contract using logs
            var signature = web3.sha3("SBCreation(address,uint256)");
            // Find all past logs containing SBCreation event
            var filter = web3.eth.filter({fromBlock: _fromBlock, toBlock: "latest", topics: [signature]});
            return filter.get(function(error, result) {
                if (!error)
                    resolve(result.map((item, index) => item.address));
                else
                    reject(error);
            });
        });
    },

    /**
     * Load SmartBudgetInstance from address
     */
    fromAddress: async function(address) {
        var instance = await this._truffleContract.at(address);
        return new SmartBudgetInstance(instance);
    },

    /**
     * Create (Deploy) new SmartBudget instance
     */
    create : async function(tenderLockTime, 
        tenderLockType, deliveryLockTime, 
        deliveryLockType, rootName, stake, fromAddress) {
            console.log("Creating new instance...")
            var instance = await this._truffleContract.new(tenderLockTime, 
                tenderLockType, deliveryLockTime, deliveryLockType, rootName, 
                {value: web3.toWei(stake, 'ether'),
                 from: fromAddress});
            return new SmartBudgetInstance(instance);
    }
};

/**
 * Main JS wrapper object to interact with the Ethereum network.
 * Calls the interal truffle-contract instance's functions
 * Verifies inputs
 * Parses outputs
 */
function SmartBudgetInstance(instance)  {

    /**
     * This is the truffle-contract instance, which already has an address
     */
    this.instance = instance;

    //------------------------------------- Events ---------------------------------------------
    /**
     * Events & watch callback setters
     */
    this.addNodeEvent = this.instance.SBNodeAdded();
    this.addCandidateEvent = this.instance.SBCandidateAdded();
    this.approveCandidateEvent = this.instance.SBCandidateApproved();
    this.completedNodeEvent = this.instance.SBNodeCompleted();

    this.setAddNodeCallback = function(cb) {
        // Uninstall any previous filter
        this.addNodeEvent.stopWatching();
        // Set callback
        this.addNodeEvent.watch(cb);  
    };

    this.setAddCandidateCallback = function(cb) {
        // Uninstall any previous filter
        this.addCandidateEvent.stopWatching();
        // Set callback
        this.addCandidateEvent.watch(cb);  
    };

    this.setApproveCandidateCallback = function(cb) {
        // Uninstall any previous filter
        this.approveCandidateEvent.stopWatching();
        // Set callback
        this.approveCandidateEvent.watch(cb);  
    };

    this.setCompletedNodeCallback = function(cb) {
        // Uninstall any previous filter
        this.completedNodeEvent.stopWatching();
        // Set callback
        this.completedNodeEvent.watch(cb);  
    };

    /**
     * Call this when you're done with the object
     */
    this.stopAllWatches = function () {
        this.addNodeEvent.stopWatching();
        this.addCandidateEvent.stopWatching();
        this.approveCandidateEvent.stopWatching();
        this.completedNodeEvent.stopWatching();
    };

    //------------------------------------- Timing -----------------------------------------------

    this.tenderLockTime = async function() {
        var tenderLockTime = await this.instance.tenderLockTime();
        var tenderLockDate = new Date(tenderLockTime*1000);
        console.log("The tender lock time is: " + tenderLockDate);
        return tenderLockDate;
    }

    this.secondsToTenderEnd = async function() {
        var now = new Date().getTime() / 1000;
        var tenderLockTime = await this.instance.tenderLockTime();
        var secsToTenderEnd = tenderLockTime - now;
        console.log("The remaining seconds until tender time lock end: " + secsToTenderEnd);
    }

    this.deliveryLockTime = async function() {
        var deliveryLockTime = await this.instance.deliveryLockTime();
        var deliveryLockDate = new Date(deliveryLockTime*1000);
        console.log("The delivery lock time is: " + deliveryLockDate);
        return deliveryLockDate;
    }

    this.secondsToDeliveryEnd = async function() {
        var now = new Date().getTime() / 1000;
        var deliveryLockTime = await this.instance.deliveryLockTime();
        var secsToDeliveryEnd = deliveryLockTime - now;
        console.log("The remaining seconds until delivery time lock end: " + secsToDeliveryEnd);
    }

    //------------------------------------- Validators ------------------------------------------
    // Wraps any smart contract function an transforms revert to failed, and successful execution to passed
    async function testWrapper (testPromise, errCallback) {
        try {
            await testPromise;
            return "passed";
          } catch(err) {
            var msg = await errCallback();
            throw new Error(msg);
          }
    };
    
    /**
     * Validates nodeId
     */
    this.validateNodeId = async function(nodeId, errCallback) {
        return await testWrapper(this.instance.validateNodeId(nodeId), errCallback);
    };

    /**
     * Validates validateCandidateId
     */
    this.validateCandidateId = async function(candidateId, errCallback) {
        return await testWrapper(this.instance.validateCandidateId(candidateId), errCallback);
    };

    /**
     * Requires a specific contract state
     */
    this.requireContractState = async function(stateName, errCallback) {
         /*
        * ContractState enum disrcibes the state of the smartbudget contract.
        * INVALID   - 0 - Before initalization is complete
        * CANCELLED - 1 - Some first-level subprojects of the main project have not been approved
        * TENDER    - 2 - Contract is in the tender period
        * DELIVERY  - 3 - Contract is in delivery period
        * FINISHED  - 4 - Delivery time lock has expired, withdraw is opened
        */
       var stateId;
       switch (stateName) {
        case "INVALID":
            stateId = 0;
            break;
        case "CANCELLED":
            stateId = 1;
            break;
        case "TENDER":
            stateId = 2;
            break;
        case "DELIVERY":
            stateId = 3;
            break;
        case "FINISHED":
            stateId = 4;
            break;
        default:
            throw new Error("Contract state can only be one of INVALID/CANCELLED/TENDER/DELIVERY/FINISHED, received " + stateName);
        };
        return await testWrapper(this.instance.requireContractState(stateId), errCallback);
    };

    /**
     * Requires the contract's state to be after stateName
     */
    this.requireContractStateAfter = async function(stateName, errCallback) {
        /*
       * ContractState enum disrcibes the state of the smartbudget contract.
       * INVALID   - 0 - Before initalization is complete
       * CANCELLED - 1 - Some first-level subprojects of the main project have not been approved
       * TENDER    - 2 - Contract is in the tender period
       * DELIVERY  - 3 - Contract is in delivery period
       * FINISHED  - 4 - Delivery time lock has expired, withdraw is opened
       */
      var stateId;
      switch (stateName) {
       case "INVALID":
           stateId = 0;
           break;
       case "CANCELLED":
           stateId = 1;
           break;
       case "TENDER":
           stateId = 2;
           break;
       case "DELIVERY":
           stateId = 3;
           break;
       case "FINISHED":
           stateId = 4;
           break;
       default:
           throw new Error("Contract state can only be one of INVALID/CANCELLED/TENDER/DELIVERY/FINISHED, received " + stateName);
       };
       var actualStateId = this.instance.getContractState();
       return await testWrapper(async () => {
           if (actualStateId <= stateId) {
               throw new Error("Invalid state");
           } else {
               return true;
           }
       }, errCallback);
   };

    /**
     * Requires a specific node state
     */
    this.requireNodeState = async function(nodeId, stateName, errCallback) {
       /*
        * NodeState enum disrcibes the state of nodes.
        * OPEN       - 0 - The node has been created but has not been approved by the parent. Candidates may apply for the node
        * APPROVED   - 1 - Parent node has approved one of the candidates
        * COMPLETED  - 2 - Root has accepted the delivered work, 
        *                  promised stake will be withdrawable by the node owner 
        *                  after the delivery time lock has expired
        * PAYED      - 3 - Owner of the node has alreay withdrawn its stake from the contract
        */
      var stateId;
      switch (stateName) {
       case "OPEN":
           stateId = 0;
           break;
       case "APPROVED":
           stateId = 1;
           break;
       case "COMPLETED":
           stateId = 2;
           break;
       case "PAYED":
           stateId = 3;
           break;
       default:
           throw new Error("Node state can only be one of OPEN/APPROVED/COMPLETED/PAYED, received " + stateName);
       };
       return await testWrapper(this.instance.requireNodeState(nodeId, stateId), errCallback);
   };

    /**
     * Requires the message sender to be the node's owner
     */
    this.requireNodeOwner = async function(fromAddress, nodeId, errCallback) {
        return await testWrapper(this.instance.requireNodeOwner(nodeId, {from: fromAddress}), errCallback);
    };

    /**
     * Requires the message sender to be the owner of the node's parent
     */
    this.requireNodeParentOwner = async function(fromAddress, nodeId, errCallback) {
        return await testWrapper(this.instance.requireNodeParentOwner(nodeId, {from: fromAddress}), errCallback);
    };

    /**
     * Validates that the node has enough stake to cover the proposed amount in the subcontract
     */
    this.validateStake = async function(stakeInWei, nodeId, errCallback) {
        return await testWrapper(this.instance.validateStake(stakeInWei, nodeId), errCallback);
    };

    //------------------------------------- Getters ---------------------------------------------
    /**
     * Get contract state
     */
    this.getContractState = async function() {
        var state = await this.instance.getContractState();
        /*
        * ContractState enum disrcibes the state of the smartbudget contract.
        * INVALID   - 0 - Before initalization is complete
        * CANCELLED - 1 - Some first-level subprojects of the main project have not been approved
        * TENDER    - 2 - Contract is in the tender period
        * DELIVERY  - 3 - Contract is in delivery period
        * FINISHED  - 4 - Delivery time lock has expired, withdraw is opened
        */
        switch (state.toString()) {
            case "0":
                return "INVALID";
            case "1":
                return "CANCELLED";
            case "2":
                return "TENDER";
            case "3":
                return "DELIVERY";
            case "4":
                return "FINISHED";
            default:
                throw new Error("JS function getContractState is not compatible with smart contract version!");
        };
    };

    /**
     * Parse node state
     */
    function parseNodeState(stateId) {
       /*
        * NodeState enum disrcibes the state of nodes.
        * OPEN       - 0 - The node has been created but has not been approved by the parent. Candidates may apply for the node
        * APPROVED   - 1 - Parent node has approved one of the candidates
        * COMPLETED  - 2 - Root has accepted the delivered work, 
        *                  promised stake will be withdrawable by the node owner 
        *                  after the delivery time lock has expired
        * PAYED      - 3 - Owner of the node has alreay withdrawn its stake from the contract
        */
        switch (stateId.toString()) {
            case "0":
                return "OPEN";
            case "1":
                return "APPROVED";
            case "2":
                return "COMPLETED";
            case "3":
                return "PAYED";
            default:
                throw new Error("JS function getNodeState is not compatible with smart contract version!");
        };
    };

    /**
     * GetNodeWeb wrapper
     */
    this.getNodeWeb = async function(nodeId) {
        /** "stake" : "Stake of node",
        *   "addr" : "Address of node",
        *   "state" : "State of node",
        *   "cands" : "Array of candidate ids",
        *   "desc" : "Description of node",
        *   "parent" : "Id of parent node",
        *   "childs" : "Array of child node ids"
        */
        var attributes = await this.instance.getNodeWeb(nodeId, {gas: 500000 });
        var smartNode = {id: nodeId, 
            stakeInWei: attributes[0].toNumber(),
            address: attributes[1].toString(),
            state: parseNodeState(attributes[2]),
            candidateIds: attributes[3].map((id) => id.toNumber()),
            name: attributes[4].toString(),
            parentId: attributes[5].toNumber(),
            childIds: attributes[6].map((id) => id.toNumber())};
        return smartNode;
    }


    /**
     * GetCandidateWeb wrapper
     */
    this.getCandidateWeb = async function(candidateId) {
        /** "name" : "Name of the  candidate",
        *   "stake" : "Proposed stake of candidate",
        *   "addr" : "Address of candidate"
        */
        var attributes = await this.instance.getCandidateWeb(candidateId, {gas: 500000 });
        var cand = {id: candidateId, 
            name: attributes[0].toString(),
            stakeInWei: attributes[1].toNumber(),
            addr: attributes[2].toString()};
        return cand;
    }

    /**
     * The recursive function that gets the details of the nodes
     */
    this.visitNode = async function (nodeId, currDepth, maxDepth) {
        // Get node by ID    
        // Check if we have reached the max depth
        if (currDepth >= maxDepth) {
            return {};
        } else {
            var node = await this.getNodeWeb(nodeId);
            // Add field children, which will be parsed by fancytree
            if (node.childIds.length > 0) {
                node.children = await Promise.all(node.childIds.map( async (childId) => await this.visitNode(childId, currDepth + 1, maxDepth) ));
            } else {
                node.children = [];
            }
            //console.log("[visitNode] Loaded node with id " + nodeId + ", the result is: " + JSON.stringify(node));
            return node;
        }
    };

    /**
     * The function that gets the details of the nodes in a flat list
     */
    this.getNotesFlat = async function () {
        var numNodes = await this.nodeCntr();
        allNodes = [];
        for (var i=0; i < numNodes; ++i) {
            allNodes.push(await this.getNodeWeb(nodeId));
        }   
    };

    /**
     * The function that gets the details of the candidates in a flat list
     */
    this.getCandidatesFlat = async function () {
        var numCandidates = await this.candidateCntr();
        allCandidates = [];
        for (var i=0; i < numCandidates; ++i) {
            allCandidates.push(await this.getCandidateWeb(nodeId));
        }   
    };

    /**
     * The recursive function that gets the details of the nodes
     */
    this.visitFilteredNode = async function (nodeId, currDepth, maxDepth, searchTerm) {
        // Get node by ID    
        // Check if we have reached the max depth
        if (currDepth >= maxDepth) {
            return {};
        } else {
            var node = await this.getNodeWeb(nodeId);
            // Add field children, which will be parsed by fancytree
            if (node.childIds.length > 0) {
                node.children = await Promise.all(node.childIds.map(async (childId) => await this.visitFilteredNode(childId, currDepth + 1, maxDepth, searchTerm)));
            } else {
                node.children = [];
            }

            if(searchTerm[1] != ""){
                if (node.name.toUpperCase().includes(searchTerm[0].toUpperCase()) && node.state == searchTerm[1]) {
                    var temp = {stake: node.stake, state: node.state, name: node.name}
                    this.smartNodes.push(temp);                    
                }
            }else{
                if (node.name.toUpperCase().includes(searchTerm[0].toUpperCase())) {
                    var temp = {stake: node.stake, state: node.state, name: node.name}
                    this.smartNodes.push(temp);                    
                }
            }
           

            return node;
        }
    };

    /**
     * Get the complete node subtree starting from startNode filtered by <searchterm [name, state]>. The maximum allowed depth is maxDepth
     */
    this.getFilteredNodes = async function (startNode, maxDepth, searchTerm) {
        this.smartNodes = [];
        var subTree = await this.visitFilteredNode(startNode, 0, maxDepth, searchTerm);
        return this.smartNodes;
    };

    /**
     * Get the complete node subtree starting from startNode. The maximum allowed depth is maxDepth
     */
    this.getSubTree = async function (startNode, maxDepth) {
        var subTree = await this.visitNode(startNode, 0, maxDepth);
        return subTree;
    };

    //------------------------------------- Updaters ---------------------------------------------
    /**
    *   Wrapper for SmartBudget.addNode(string desc, uint parentId)
    *   Returns the emitted event's arguments
    */
   this.addNode = async function (fromAddress, description, parentId) {
        console.log("Called contract.addNode with parmeters: (" + fromAddress + "," + description + "," + parentId + ")");
        
        await this.requireContractState("TENDER", async () => {
            var actualState = await this.getContractState();
            var msg = "Cannot add new node, contract is required " +
                        "to be in TENDER state, but the actual state is " + actualState;
            alert(msg);
            return msg;
        });

        await this.validateNodeId(parentId, async () => {
            msg = "Error: parent id " + parentId + " is not a valid id!";
            alert(msg);
            return msg;
        });

        await this.requireNodeOwner(fromAddress, parentId, async () => {
            var node = await this.getNodeWeb(parentId);
            var msg = "Cannot add new node, because you're not the owner of node " + 
                        node.name + " (id: " + node.id + ")";
            alert(msg);
            return msg;
        });
        
        var res = await this.instance.addNode(description, parentId, {from: fromAddress});
        // By construction, the transaction will contain a single event
        var newId = res.logs[0].args.id.toNumber();
        console.log("Awaited addNode, the new node's id is: " + newId);
        return newId;    
    };

    /**
     * Wrapper for SmartBudget.applyForNode(uint nodeId, string name, uint stake)
     * Returns the emitted event's arguments
     */
    this.applyForNode = async function (fromAddress, nodeId, name, stakeInWei) {
        console.log("Called contract.applyForNode with parmeters: (" + fromAddress + "," + nodeId + "," + name + "," + stakeInWei + ")");

        await this.requireContractState("TENDER", async () => {
            var actualState = await this.getContractState();
            var msg = "Cannot apply for node, contract is required " +
                        "to be in TENDER state, but the actual state is " + actualState;
            alert(msg);
            return msg;
        });

        await this.validateNodeId(nodeId, async () => {
            msg = "Error: parent id " + nodeId + " is not a valid id!";
            alert(msg);
            return msg;
        });

        await this.requireNodeState(nodeId, "OPEN", async () => {
            var node = await this.getNodeWeb(nodeId);
            var msg = "Cannot apply for node " + node.name + " (id: " + node.id + 
                        "), because node state should be OPEN, while the actual state is " + 
                        node.state;
            alert(msg);
            return msg;
        });

        // Validate stake
        var node = await this.getNodeWeb(nodeId);
        var parentId = node.parentId;
        
        await this.validateStake(stakeInWei, parentId, async () => {
            var parentNode = await this.getNodeWeb(parentId);
            var msg = "Cannot apply for node " + node.name + " (id: " + node.id + 
                        "), because the proposed stake (" + web3.fromWei(stakeInWei, "ether") + " ETH)" + 
                        " is more than the total stake available for the parent node (" + 
                        web3.fromWei(parentNode.stakeInWei, "ether") + " ETH)";
            alert(msg);
            return msg;
        });

        var res = await this.instance.applyForNode(nodeId, name, stakeInWei, {from: fromAddress});
        // By construction, the transaction will contain a single event
        var newId = res.logs[0].args.id.toNumber();
        console.log("Awaited applyForNode, the new candidate's id is: " + newId);
        return newId;         
    };

    /**
     * Wrapper for SmartBudget.approveNode(uint nodeId, uint candidateId)
     * Returns the emitted event's arguments
     */
    this.approveNode = async function (fromAddress, nodeId, candidateId) {
        await this.requireContractState("TENDER", async () => {
            var actualState = await this.getContractState();
            var msg = "Cannot approve node, contract is required " +
                        "to be in TENDER state, but the actual state is " + actualState;
            alert(msg);
            return msg;
        });

        await this.validateNodeId(nodeId, async () => {
            var msg = "Error: parent id " + nodeId + " is not a valid id!";
            alert(msg);
            return msg;
        });

        await this.validateCandidateId(candidateId, async () => {
            var msg = "Error: candidate id " + candidateId + " is not a valid id!";
            alert(msg);
            return msg;
        });

        await this.requireNodeState(nodeId, "OPEN", async () => {
            var node = await this.getNodeWeb(nodeId);
            var msg = "Cannot apply for node " + node.name + " (id: " + node.id + 
                        "), because node state should be OPEN, while the actual state is " + 
                        node.state;
            alert(msg);
            return msg;
        });

        // Validate owner
        var node = await this.getNodeWeb(nodeId);
        var parentId = node.parentId;
        var parentNode = await this.getNodeWeb(parentId);
        var stakeInWei = parentNode.stakeInWei;

        await this.requireNodeOwner(fromAddress, parentId, async () => {
            var cand = this.getCandidateWeb(candidateId);
            var msg = "Cannot approve candidate " + cand.name + " (id: " + cand.id + 
                        "), because you're not the owner of the parent node " + 
                        parentNode.name + " (id: " + parentNode.id + ")";
            alert(msg);
            return msg;
        });

        // Validate stake
        await this.validateStake(stakeInWei, parentId, async () => {
            var cand = this.getCandidateWeb(candidateId);
            var msg = "Cannot approve candidate " + cand.name + " (id: " + cand.id + 
                        "), because the proposed stake (" + web3.fromWei(stakeInWei, "ether") + " ETH)" + 
                        " is more than the total stake available for the parent node (" + 
                        web3.fromWei(parentNode.stakeInWei, "ether") + " ETH)";
            alert(msg);
            return msg;
        });

        console.log("Called contract.approveNode with parmeters: (" + fromAddress + "," + nodeId + "," + candidateId + ")");
        /** Do input checks here */
        var res = await this.instance.approveNode(nodeId, candidateId, {from: fromAddress});
        console.log("Node " + nodeId + " successfully approved!");
    };

    /**
     * Wrapper for SmartBudget.markNodeComplete(uint nodeId)
     */
    this.markNodeComplete = async function (fromAddress, nodeId) {
        console.log("Called contract.markNodeComplete with parmeters: (" + fromAddress + "," + nodeId + ")");

        await this.requireContractStateAfter("TENDER", async () => {
            var actualState = await this.getContractState();
            var msg = "Cannot mark node complete, contract is required " +
                        "to be past TENDER state, but the actual state is " + actualState;
            alert(msg);
            return msg;
        });

        await this.validateNodeId(nodeId, async () => {
            var msg = "Error: node id " + nodeId + " is not a valid id!";
            alert(msg);
            return msg;
        });

        var rootId = 0;      
        await this.requireNodeOwner(fromAddress, rootId, async () => {
            var rootNode = await this.getNodeWeb(rootId);
            var msg = "Only the owner of the root project " + 
                        rootNode.name + " (id: " + rootNode.id + ") can mark nodes complete";
            alert(msg);
            return msg;
        });

        await this.requireNodeState(nodeId, "APPROVED", async () => {
            var node = await this.getNodeWeb(nodeId);
            var msg = "Cannot apply for node " + node.name + " (id: " + node.id + 
                        "), because node state should be OPEN, while the actual state is " + 
                        node.state;
            alert(msg);
            return msg;
        });

        var res = await this.instance.markNodeComplete(nodeId, {from: fromAddress});
        console.log("Node " + nodeId + " successfully marked complete!");
    }

     //------------------------------------- Payment functions ---------------------------------------------
     /**
      * Withdraw function
      */
     this.withdraw = async function (fromAddress, nodeId) {
        console.log("Called contract.withdraw with parmeters: (" + fromAddress + "," + nodeId + ")");

        await this.requireContractState("FINISHED", async () => {
            var actualState = await this.getContractState();
            var msg = "Cannot withdraw stake, contract is required " +
                        "to be in FINISHED state, but the actual state is " + actualState;
            alert(msg);
            return msg;
        });

        await this.validateNodeId(nodeId, async () => {
            var msg = "Error: node id " + nodeId + " is not a valid id!";
            alert(msg);
            return msg;
        });

        var node = await this.getNodeWeb(nodeId);
        if (node.state == "COMPLETED") {
            await this.requireNodeOwner(fromAddress, nodeId, async () => {
                var msg = "Cannot withdraw stake of node " + node.name + " (id: " + node.id + 
                            "), because you're not the owner";
                alert(msg);
                return msg;
            });
        } else if (node.state == "APPROVED") {
            var rootId = 0;
            await this.requireNodeOwner(fromAddress, rootId, async () => {
                var msg = "Cannot withdraw stake of node " + node.name + " (id: " + node.id + 
                            "), because only the root owner may withdraw the stake, as the task was not marked complete";
                alert(msg);
                return msg;
            });
        } else {
            var msg = "Node should be either in COMPLETED or APPROVED state, but its state is " + node.state;
            alert(msg);
            throw new Error(msg);
        }

        var res = await this.instance.withdraw(nodeId, {from: fromAddress});
        console.log("Withdrawal from node " + nodeId + " successfully completed!");
     }

     /**
      * Cancel function
      */
     this.cancel = async function (fromAddress) {
        console.log("Called contract.cancel with parmeters: (" + fromAddress + ")");

        await this.requireContractState("CANCELLED", async () => {
            var actualState = await this.getContractState();
            var msg = "Cannot redeem stake from contranct, contract is required " +
                        "to be in CANCELLED state, but the actual state is " + actualState;
            alert(msg);
            return msg;
        });

        rootId = 0;
        await this.requireNodeOwner(fromAddress, rootId, async () => {
            var msg = "Only the root owner can redeem stake from the contract.";
            alert(msg);
            return msg;
        });

        var res = await this.instance.cancel(nodeId, {from: fromAddress});
        console.log("Stake redemption successfully competed!");
     }
};
