// export needed for ES6 module dependency
export const SmartBudgetService = {

    /**
     * This is the contract instance, which has an address
     */
    _instance: null,

    /**
     * Watcher objects
     */
    _addNodeEvent: null,
    _addCandidateEvent: null,
    _approveCandidateEvent: null,
    _completedNodeEvent: null,

    init: function (instance) {
        var self = this;
        self._instance = instance;
        self._addNodeEvent = self._instance.SBNodeAdded();
        self._addCandidateEvent = self._instance.SBCandidateAdded();
        self._approveCandidateEvent = self._instance.SBCandidateApproved();
        self._completedNodeEvent = self._instance.SBNodeCompleted();
    },

    setAddNodeCallback: function(cb) {
        // Uninstall any previous filter
        this._addNodeEvent.stopWatching();
        // Set callback
        console.log("Set new callback");
        this._addNodeEvent.watch(cb);  
    },

    setAddCandidateCallback: function(cb) {
        // Uninstall any previous filter
        this._addCandidateEvent.stopWatching();
        // Set callback
        this._addCandidateEvent.watch(cb);  
    },

    setApproveCandidateCallback: function(cb) {
        // Uninstall any previous filter
        this._approveCandidateEvent.stopWatching();
        // Set callback
        this._approveCandidateEvent.watch(cb);  
    },

    setCompletedNodeCallback: function(cb) {
        // Uninstall any previous filter
        this._completedNodeEvent.stopWatching();
        // Set callback
        this._completedNodeEvent.watch(cb);  
    },

    /**
     * The recursive function that gets the details for the nodes
     */
    visitNode: async function (nodeId, currDepth, maxDepth) {
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
            var attributes = await this._instance.getNodeWeb(nodeId, {gas: 500000 });
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
    },

    /**
     * Get the complete node subtree starting from startNode. The maximum allowed depth is maxDepth
     */
    getSubTree: async function (startNode, maxDepth) {
        var subTree = await this.visitNode(startNode, 0, maxDepth);
        return subTree;
    },

    /**
     * Create contractors
     */
    addContractor: async function (fromAddress, nodeId, name, stake) {
        console.log("Called contract.addNode with parmeters: (" + fromAddress + "," + description + "," + parentId + ")");
        /** Do input checks here */
        var res = await this._instance.addNode(description, parentId, {from: fromAddress});
        console.log("Awaited addNode, the returned log is " + JSON.stringify(res.logs));
        /** Parse logs and select the relevant one here */
        return res.logs[0].args;    
    },

    /**
    *   Wrapper for SmartBudget.addNode(string desc, uint parentId)
    *   Returns the emitted event's arguments
    */
    addNode: async function (fromAddress, description, parentId) {
        console.log("Called contract.addNode with parmeters: (" + fromAddress + "," + description + "," + parentId + ")");
        /** Do input checks here */
        var res = await this._instance.addNode(description, parentId, {from: fromAddress});
        console.log("Awaited addNode, the returned log is " + JSON.stringify(res.logs));
        /** Parse logs and select the relevant one here */
        return res.logs[0].args;    
    },

    /*
    *  To create an async env in a sync func: (async () => { statements })();
    */


    /**
     * Wrapper for SmartBudget.applyForNode(uint nodeId, string name, uint stake)
     * Returns the emitted event's arguments
     */
    applyForNode: async function (fromAddress, nodeId, name, stake) {
        console.log("Called contract.applyForNode with parmeters: (" + fromAddress + "," + nodeId + "," + name + "," + stake + ")");
        /** Do input checks here */
        var res = await this._instance.applyForNode(nodeId, name, stake, {from: fromAddress});
        console.log("Awaited applyForNode, the returned log is " + JSON.stringify(res.logs));
        /** Parse logs and select the relevant one here */
        return res.logs[0].args;  
    },

    /**
     * Wrapper for SmartBudget.approveNode(uint nodeId, uint candidateId)
     * Returns the emitted event's arguments
     */
    approveNode: async function (fromAddress, nodeId, candidateId) {
        console.log("Called contract.approveNode with parmeters: (" + fromAddress + "," + nodeId + "," + candidateId + ")");
        /** Do input checks here */
        var res = await this._instance.approveNode(nodeId, candidateId, {from: fromAddress});
        console.log("Awaited approveNode, the returned log is " + JSON.stringify(res.logs));
        /** Parse logs and select the relevant one here */
        return res.logs[0].args;  
    },

    /**
     * Wrapper for SmartBudget.markNodeComplete(uint nodeId)
     */
    markNodeComplete: async function (fromAddress, nodeId) {
        console.log("Called contract.markNodeComplete with parmeters: (" + fromAddress + "," + nodeId + ")");
        /** Do input checks here */
        var res = await this._instance.markNodeComplete(nodeId, {from: fromAddress});
        console.log("Awaited markNodeComplete, the returned log is " + JSON.stringify(res.logs));
        /** Parse logs and select the relevant one here */
        return res.logs[0].args;  
    }
};
