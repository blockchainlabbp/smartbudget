// export needed for ES6 module dependency
export const SmartBudgetService = {

    /**
     * Access the SmartBudget contract via dependency injection
     */
    _smartBudgetContract: null,

    _account: null,

    /**
     * Check whether this tree node has the defined index
     * @returns true/false
     */
    _isTreeElem: function _isTreeElem(treeNode, idx) {
        return treeNode.id === idx;
    },

    /**
     * Find and return tree node with defined index
     * @returns node or undefined
     */
    _findTreeElem: function _findTreeElem(treeNode, idx) {
        if (SmartBudgetService._isTreeElem(treeNode, idx)) {
            return treeNode;
        }
        else {
            for (var i = 0; i < treeNode.children.length; i++) {
                var found = _findTreeElem(treeNode.children[i], idx);
                if (typeof found !== 'undefined') {
                    return found;
                }
            }
        }
    },

    /**
     * Iterates over the tree DFS manner
     */
    _visitTree: function _visitTree(treeNode, visitorCallback) {
        visitorCallback(treeNode);
        treeNode.children.forEach((val) => SmartBudgetService._visitTree(val, visitorCallback));
    },

    /** convert triplet coming from contract to
     *  [[{id: 0}, {id: 0}, ...], 
     *  [{stake: 100}, {stake: 15}, ...], 
     *  [{parentid: 0}, {parentid: 1}, ...]]
     */
    _convertTriplet1: function (triplet) {
        triplet[0] = triplet[0].map((val) => { return { id: val } });
        triplet[1] = triplet[1].map((val) => { return { stake: val } });
        triplet[2] = triplet[2].map((val) => { return { parentid: val } });
        triplet[3] = triplet[3].map((val) => { return { address: val } });

        return triplet;
    },

    /**
     * Reduce input from the output _convertTriplet1 to
     * [{id: 0, stake: 100, parentid: 0}, ... ]
     */
    _convertTriplet2: function (triplet1) {
        return triplet1.reduce(
            (acc, curr) => {
                curr.forEach((element, i) => {
                    if (typeof acc[i] === 'undefined') {
                        acc[i] = { children: [] };
                    }

                    // copy the properties to the same index in acc array
                    Object.assign(acc[i], element);
                })
                return acc;
            }, []);
    },

    /**
     * Build Tree from the output of _convertTriplet2
     */
    _convertTriplet3: function (flatTree) {
        var newTreeRoot = { id: -1, children: [] };

        flatTree.forEach((val, index) => {
            var foundParent = SmartBudgetService._findTreeElem(newTreeRoot, val.parentid);

            if (typeof foundParent === 'undefined') {
                newTreeRoot.children.push(val);
            }
            else {
                foundParent.children.push(val);
            }
        });

        return newTreeRoot.children;
    },

    /**
     * Build a tree from nodes triplet
     */
    _convertNodesTripletToTree: function (nodesArray) {
        nodesArray = SmartBudgetService._convertTriplet1(nodesArray);
        nodesArray = SmartBudgetService._convertTriplet2(nodesArray);
        return SmartBudgetService._convertTriplet3(nodesArray);
    },

    init: function (smartBudgetContract, account) {
        var self = this;
        self._smartBudgetContract = smartBudgetContract;
        self._account = account;
    },

    /**
     * Get the nodes from the smart contract
     */
    getContractors: function () {
        var self = this;
        var meta;

        console.log(self._smartBudgetContract);

        return self._smartBudgetContract.deployed().then(function (instance) {
            meta = instance;
            return meta.getNodes.call({ from: self._account, gas: 500000 });
        }).then(function (nodesArray) {
            // (int[] _ids, uint[] _stakes, int[] _parentIds, address[] _addresses)
            console.log(nodesArray);
            return self._convertNodesTripletToTree(nodesArray);
        });
    },

    /**
     * Create the investor node (root node)
     */
    addInvestor: function (stake) {
        var self = this;
        var meta;

        const desc = "root desc";

        return self._smartBudgetContract.deployed().then(function (instance) {
            meta = instance;
            return meta.addRoot.sendTransaction(stake, desc, { from: self._account, gas: 600000 });
        });
    }, 

    /**
     * Create contractors
     */
    addContractor: function (stake, parentid) {
        var self = this;
        var meta;

        const desc = "contractor";

        return self._smartBudgetContract.deployed().then(function (instance) {
            meta = instance;
            return meta.addChild.sendTransaction(stake, desc, parentid, { from: self._account, gas: 300000 });
        });
    },

    assignAddress: function (address) {
        // TODO: assign an ethereum address for the contractor node
    },

    deleteContractor: function (id) {
        //
    }
};
