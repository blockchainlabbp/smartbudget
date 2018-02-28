pragma solidity ^0.4.2;

contract TreeDataStructure {

    /*
    * State enum disrcibes the state of the node.
    * TENTATIVE - Node hasn't got any candidate.
    * APPROVED - Root selected a "winner" candidate.
    * PAYED - Subcontractor of certain node is payed by root.
    * GETREVIEW - Root didn't start the payout proccess, because subcontractor didn't finish their work.
    */
    enum State {TENTATIVE,APPROVED,PAYED,GETREVIEW}

    /*
    * Node struct represents a part of the project.
    * id uint - identifier of node 
    * stake uint - allocated ethereum on the node
    * addr address - address of selected candidate
    * state State - state of the node
    * candidates uint[] - keys of the candidates (which are in candidates map)
    * desc string - description of the node
    * parent uint - id of node's parent
    * childs uint[] - keys of node's childs (which are in nodes map)
    */
    struct Node {      
        uint id;
        uint stake;
        address addr; 
        State state;
        uint[] candidates;
        string desc;
        uint parent;
        uint[] childs;
    }

    /*
    * Candidate struct is a datastructure for candidates.
    * name string - name of candidates (for example: Apple :D)
    * addr address - ethereum addres of candidate
    */
    struct Candidate {      
        string name;
        address addr;
    }

    /** nodeCntr uint - number of nodes (map type hasn't got length attribute) */
    uint public nodeCntr;
    /** root uint - root node id (key in nodes map) */
    uint root;
    /** nodes mapping (uint => Node) - map of nodes (map require by bidirected list functionality) */
    mapping (uint => Node) nodes;

    /** candidateCntr uint - number of candidates */
    uint public candidateCntr;
    /** candidates mapping (uint => Candidate) - map of candidates */
    mapping (uint => Candidate) candidates;


    /** @dev Constructor for initialize counters */
    function TreeDataStructure() public {
        nodeCntr = 0;
        candidateCntr = 0;
    } 

    /** @notice Add special root element (onlyOwner) 
    * @dev A node is root if its id is equal to its parent id
    * @param desc Description of node (project)
    */
    function addRoot(string desc) public payable {
        uint key = nodeCntr;
        Node memory node;
        node.id = key;
        node.stake = msg.value;
        node.addr = msg.sender;
        node.state = State.APPROVED;
        node.desc = desc;
        node.parent = key;
        nodeCntr = nodeCntr + 1;

        root = key;
        nodes[key] = node;
    }

    /** @notice Add node
    * @param stake Ethereum stake on the node
    * @param desc  Description of node
    * @param parent Parent's id of node
    */
    function addNode(uint stake, string desc, uint parent) public {

        // check the required amount of stake 
        require(stakeValidator(stake, parent) == true);

        Node memory node;
        uint key = nodeCntr;
        node.id = key;
        node.stake = stake;
        node.addr = msg.sender;
        node.state = State.TENTATIVE;
        node.desc = desc;
        node.parent = parent;
        nodeCntr = nodeCntr + 1;
                
        nodes[key] = node;

        nodes[parent].childs.push(key);
    }

    /** @notice Add candidate to certain node
    * @param nodeId Id of the node
    * @param name Candidate's name
    */
    function applyForNode(uint nodeId, string name) public {
        Candidate memory candidate;
        candidate.name = name;
        candidate.addr = msg.sender;
        uint key = candidateCntr;
        candidates[key] = candidate;
        nodes[nodeId].candidates.push(key);
        candidateCntr = candidateCntr + 1;
    }

    /** @notice Set certain node state to APPROVED (onlyOwner)
    * @param nodeId Id of the node
    * @param candidateKey Identifier of candidate (id := key)
    */
    function approveNode(uint nodeId, uint candidateKey)  public {
        nodes[nodeId].addr = candidates[candidateKey].addr;
        nodes[nodeId].state = State.APPROVED;
    }

    /** @notice [web3js] Get a node by Id (id is the key in context of map)
    * @param _key Id of the node
    * @return {
    *   "stake" : "Stake of node",
    *   "addr" : "Address of node",
    *   "state" : "State of node",
    *   "desc" : "Description of node",
    *   "parent" : "Id of parent node",
    *   "childs" : "Array of child node ids"
    * }
    */
    function getNodeWeb(uint _key) public view returns (uint stake, address addr, State state, string desc, uint parent, uint[] childs) {
        return (nodes[_key].stake, nodes[_key].addr, nodes[_key].state, nodes[_key].desc, nodes[_key].parent, nodes[_key].childs);
    }

    /** @notice [web3js] Get all addresses of candidates which are assigned with a certain node
    * @param _key Id of the node
    * @return {
    *    "_addr" : "Array of candidate addresses of node" 
    * }
    */
    function getNodeCandidatesAddressesWeb(uint _key) public view returns (address[] _addr) {

        address[] memory addr;

        for (uint i = 0; i < nodes[_key].candidates.length; i++) {
            Candidate memory candidate = candidates[nodes[_key].candidates[i]];
            addr[i] = candidate.addr;
        }

        return addr;
    }

    /** @notice [web3js] Get the most important node details from the contract. Can be used to build the tree on JS side
    * @dev Due to limitations in Solidity, we can only return tuples of arrays, but not tuples of array of arrays (e.g. array of strings) 
    * @return {
    *   "_ids" : "ids of the nodes",
    *   "_stakes" : "stakes of the nodes",
    *   "_parents" : "parents of the nodes",
    *   "_addresses" : "addresses of the nodes"
    * }
    */
    function getNodesWeb() public view returns (uint[] _ids, uint[] _stakes, uint[] _parents, address[] _addresses) {
        uint[] memory ids = new uint[](nodeCntr);
        uint[] memory parents = new uint[](nodeCntr);
        address[] memory addresses = new address[](nodeCntr);
        uint[] memory stakes = new uint[](nodeCntr);

        for (uint i = 0; i < nodeCntr; i++) {
            Node memory node = nodes[i];
            ids[i] = node.id;
            parents[i] = node.parent;
            addresses[i] = node.addr;
            stakes[i] = node.stake;
        }

        return (ids, stakes, parents, addresses);
    }

    /** @notice Returns the sum of stakes allocated to childrens of node
    * @param id The id of node to compute the total allocated stakes for
    * @return {
    *    "allocatedStake" : "The amount of stake allocated to child nodes"
    * }
    */
    function getAllocatedStake(uint id) public view returns(uint allocatedStake) {
        Node memory node = nodes[id];
        uint totalChildStakes = 0;
        for (uint i = 0; i < node.childs.length; i++) {
            totalChildStakes = totalChildStakes + nodes[node.childs[i]].stake;
        }
        return totalChildStakes;
    }

    /** @notice Returns the amount of stake available for allocation for node
    * @dev Always use getAllocatedStake() or getAvailableStake() explicitly. 
    * Currently stake = getAllocatedStake + getAvailableStake, 
    * but we might add finer categorization later 
    * (e.g. stakes locked for some distinctive reason), 
    * while this interface won't change
    * @param id The id of the node to compute the available stakes for
    * @return {
    *    "availableStake" : "The amount of stake available for allocation"
    * }
    */       
    function getAvailableStake(uint id) public view returns(uint availableStake) {
        Node memory node = nodes[id];
        uint allocStake = getAllocatedStake(id);
        return node.stake > allocStake ? node.stake - allocStake : 0;
    }

    /** @notice Checks if 'stake' amount of ethereum is still available for allocation in node with id 
    * @param stake The amount of ethereum planned to be allocated for the new node
    * @param id Id of node
    * @return {
    *    "res" : "True, if there is enough stake to allocate the new node"
    * }
    */
    function stakeValidator(uint stake, uint id) private view returns(bool res) {
        uint availableStake = getAvailableStake(id);

        if (availableStake > stake) {
            return true;
        } else {
            return false;
        }
    }
}