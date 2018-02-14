pragma solidity ^0.4.2;

contract MapBasedDataStructure {

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
    uint nodeCntr;
    /** root uint - root node id (key in nodes map) */
    uint root;
    /** nodes mapping (uint => Node) - map of nodes (map require by bidirected list functionality) */
    mapping (uint => Node) nodes;

    /** candidateCntr uint - number of candidates */
    uint candidateCntr;
    /** candidates mapping (uint => Candidate) - map of candidates */
    mapping (uint => Candidate) candidates;


    /** @dev Constructor for initialize counters */
    function MapBasedDataStructure() public {
        nodeCntr = 0;
        candidateCntr = 0;
    } 

    /** @dev Add special root element (onlyOwner) (Certain element is root if their id is equal with id of their parent)
    * @param desc string Description of node (project)
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

    /** @dev Add node
    * @param stake uint ethereum stake on the node
    * @param desc string Description of node
    * @param parent uint parent's id of node
    */
    function addNode(uint stake, string desc, uint parent) public {

        // check the required amount of stake 
        require(stakeValidator(stake, nodes[parent]) == true);

        Node memory node;
        uint key = nodeCntr;
        node.id = key;
        node.stake = stake;
        node.state = State.TENTATIVE;
        node.desc = desc;
        node.parent = parent;
        nodeCntr = nodeCntr + 1;
                
        nodes[key] = node;

        nodes[parent].childs.push(key);
    }

    /** @dev Add candidate to certain node
    * @param nodeId uint id of the node
    * @param name string candidate's name
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

    /* Set certain node state to APPROVED (onlyOwner)
    * @param nodeId uint id of the node
    * @param candidateKey uint identifier of candidate (id := key)
    */
    function approveNode(uint nodeId, uint candidateKey)  public {
        nodes[nodeId].addr = candidates[candidateKey].addr;
        nodes[nodeId].state = State.APPROVED;
    }

    /* [web3js] Get a node by Id (id is the key in context of map)
    * @return stake uint 
    * @return addr address
    * @return state State
    * @return desc string
    * @return parent uint
    * @return childs uint[]
    */
    function getNodeWeb(uint _key) public view returns (uint stake, address addr, State state, string desc, uint parent, uint[] childs) {
        return (nodes[_key].stake, nodes[_key].addr, nodes[_key].state, nodes[_key].desc, nodes[_key].parent, nodes[_key].childs);
    }

    /* [web3js] Get all addresses of candidates which are assigned with a certain node
    * @param _key uint id of the node
    * @return _addr address[] 
    */
    function getNodeCandidatesAddressesWeb(uint _key) public view returns (address[] _addr) {

        address[] memory addr;

        for (uint i = 0; i < nodes[_key].candidates.length; i++) {
            Candidate memory candidate = candidates[nodes[_key].candidates[i]];
            addr[i] = candidate.addr;
        }

        return addr;
    }

    /* [web3js] Get all nodes withouth string description
    * @return _ids uint[]
    * @return _parents uint[]
    * @return _states States[]
    * @return _stakes uint[]
    *
    */
    function getNodesWeb() public view returns (uint[] _ids, uint[] _parents, State[] _states, uint[] _stakes) {

        uint[] memory ids;
        uint[] memory parents;
        State[] memory states;
        uint[] memory stakes;

        for (uint i = 0; i < nodeCntr; i++) {
            Node memory node = nodes[i];
            ids[i] = node.id;
            parents[i] = node.parent;
            states[i] = node.state;
            stakes[i] = node.stake;
        }

        return (ids, parents, states, stakes);
    }

    /* Check, how many stake (ethereum) is available from root in the same level (in the tree) with new node
    * @param stake uint it is the expected amount of ethereum on the new node
    * @param parent Node parent of the new node
    * @return res bool true, if there are enough stake to allocate the new node
    */
    function stakeValidator(uint stake, Node parent) private view returns(bool res) {
        uint sum = 0;
        for (uint i = 0; i < parent.childs.length; i++) {
            sum = sum + nodes[parent.childs[i]].stake;
        }

        if (sum - stake > 0) {
            return true;
        } else {
            return false;
        }
    }
}