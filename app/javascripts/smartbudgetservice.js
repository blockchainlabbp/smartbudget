/**
 * SmartBudgetService: object for finding, loading and creating SmartBudgetInstance,
 * which are convenient wrappers around truffle contract instances
 */
export const SmartBudgetService = {
    _truffleContract: null,

    init: function (truffleContract) {
        var self = this;
        self._truffleContract = truffleContract;
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
        this._completedNodeEvent.stopWatching();
        // Set callback
        this._completedNodeEvent.watch(cb);  
    };

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
            state: [attributes[2]].map((stateId) => parseNodeState(stateId))[0],
            candidateIds: attributes[3].map((id) => id.toNumber()),
            name: attributes[4].toString(),
            parentId: attributes[5].toNumber(),
            childIds: attributes[6].map((id) => id.toNumber())};
        return smartNode;
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
        console.log("Awaited addNode, the returned log is " + JSON.stringify(res.logs));
        /** Parse logs and select the relevant one here */
        return res.logs[0].args;    
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
        console.log("Awaited applyForNode, the returned log is " + JSON.stringify(res.logs));
        /** Parse logs and select the relevant one here */
        return res.logs[0].args;  
        
    };

    /**
     * Wrapper for SmartBudget.approveNode(uint nodeId, uint candidateId)
     * Returns the emitted event's arguments
     */
    this.approveNode = async function (fromAddress, nodeId, candidateId) {
        console.log("Called contract.approveNode with parmeters: (" + fromAddress + "," + nodeId + "," + candidateId + ")");
        /** Do input checks here */
        var res = await this.instance.approveNode(nodeId, candidateId, {from: fromAddress});
        console.log("Awaited approveNode, the returned log is " + JSON.stringify(res.logs));
        /** Parse logs and select the relevant one here */
        return res.logs[0].args;  
    };

    /**
     * Wrapper for SmartBudget.markNodeComplete(uint nodeId)
     */
    this.markNodeComplete = async function (fromAddress, nodeId) {
        console.log("Called contract.markNodeComplete with parmeters: (" + fromAddress + "," + nodeId + ")");
        /** Do input checks here */
        var res = await this.instance.markNodeComplete(nodeId, {from: fromAddress});
        console.log("Awaited markNodeComplete, the returned log is " + JSON.stringify(res.logs));
        /** Parse logs and select the relevant one here */
        return res.logs[0].args;  
    }
};
