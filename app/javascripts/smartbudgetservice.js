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


function SmartBudgetInstance(instance)  {

    /**
     * This is the contract instance, which has an address
     */
    this.instance = instance;

    /**
     * Watcher objects
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

    /**
     * The recursive function that gets the details for the nodes
     */
    this.visitNode = async function (nodeId, currDepth, maxDepth) {
        // Get node by ID    
        // Check if we have reached the max depth
        if (currDepth >= maxDepth) {
            return {};
        } else {
            /** "stake" : "Stake of node",
            *   "addr" : "Address of node",
            *   "state" : "State of node",
            *   "cands" : "Array of candidate ids",
            *   "desc" : "Description of node",
            *   "parent" : "Id of parent node",
            *   "childs" : "Array of child node ids"
            */
            //console.log("[visitNode] Loading node with id " + nodeId);
            var attributes = await this.instance.getNodeWeb(nodeId, {gas: 500000 });
            //console.log("[visitNode] Loaded node with id " + nodeId + ", attributes are: " + attributes);
            var childIds = attributes[6].map((id) => id.toNumber());
            //console.log("[visitNode] Loading children with ids: " + childIds);
            var childList;
            if (childIds.length > 0) {
                childList = await Promise.all(childIds.map( async (childId) => await this.visitNode(childId, currDepth + 1, maxDepth) ));
            } else {
                childIds = [];
                childList = [];
            }
            var smartNode = {id: nodeId, 
                stake: attributes[0].toNumber(),
                address: attributes[1],
                state: attributes[2],
                candidates: attributes[3],
                name: attributes[4],
                parent: attributes[5].toNumber(),
                childIds: childIds,
                children: childList};
            //console.log("[visitNode] Loaded node with id " + nodeId + ", the result is: " + JSON.stringify(smartNode));
            return smartNode;
        }
    };

    /**
     * Get the complete node subtree starting from startNode. The maximum allowed depth is maxDepth
     */
    this.getSubTree = async function (startNode, maxDepth) {
        var subTree = await this.visitNode(startNode, 0, maxDepth);
        return subTree;
    };

    /**
     * Create contractors
     */
    this.addContractor = async function (fromAddress, nodeId, name, stake) {
        console.log("Called contract.addNode with parmeters: (" + fromAddress + "," + description + "," + parentId + ")");
        /** Do input checks here */
        var res = await this.instance.addNode(description, parentId, {from: fromAddress});
        console.log("Awaited addNode, the returned log is " + JSON.stringify(res.logs));
        /** Parse logs and select the relevant one here */
        return res.logs[0].args;    
    };

    /**
    *   Wrapper for SmartBudget.addNode(string desc, uint parentId)
    *   Returns the emitted event's arguments
    */
   this.addNode = async function (fromAddress, description, parentId) {
        console.log("Called contract.addNode with parmeters: (" + fromAddress + "," + description + "," + parentId + ")");
        /** Do input checks here */
        var res = await this.instance.addNode(description, parentId, {from: fromAddress});
        console.log("Awaited addNode, the returned log is " + JSON.stringify(res.logs));
        /** Parse logs and select the relevant one here */
        return res.logs[0].args;    
    };

    /*
    *  To create an async env in a sync func: (async () => { statements })();
    */


    /**
     * Wrapper for SmartBudget.applyForNode(uint nodeId, string name, uint stake)
     * Returns the emitted event's arguments
     */
    this.applyForNode = async function (fromAddress, nodeId, name, stake) {
        console.log("Called contract.applyForNode with parmeters: (" + fromAddress + "," + nodeId + "," + name + "," + stake + ")");
        /** Do input checks here */
        var res = await this.instance.applyForNode(nodeId, name, stake, {from: fromAddress});
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
