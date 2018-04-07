pragma solidity ^0.4.2;

import "./TimeLock.sol";

contract SmartBudget is TimeLock {
    //------------------------------Enums--------------------------------------------------

    /*
    * ContractState enum disrcibes the state of the smartbudget contract.
    * INVALID   - 0 - Before initalization is complete
    * TENDER    - 1 - Contract is in the tender period
    * DELIVERY  - 2 - Contract is in delivery period
    * FINISHED  - 3 - Delivery time lock has expired, withdraw is opened
    * CANCELLED - 4 - Some first-level subprojects of the main project have not been approved
    */
    enum ContractState {INVALID, CANCELLED, TENDER, DELIVERY, FINISHED}

    /*
    * NodeState enum disrcibes the state of nodes.
    * OPEN       - 0 - The node has been created but has not been approved by the parent. Candidates may apply for the node
    * APPROVED   - 1 - Parent node has approved one of the candidates
    * COMPLETED  - 2 - Root has accepted the delivered work, 
    *                  promised stake will be withdrawable by the node owner 
    *                  after the delivery time lock has expired
    * PAYED      - 3 - Owner of the node has alreay withdrawn its stake from the contract
    */
    enum NodeState {OPEN, APPROVED, COMPLETED, PAYED}


    //------------------------------Member vars------------------------------------------------


    /*
    * Node struct represents a part of the project.
    * id uint - identifier of node 
    * stake uint - allocated ethereum on the node
    * addr address - address of selected candidate
    * state NodeState - state of the node
    * candidates uint[] - keys of the candidates (which are in candidates map)
    * desc string - description of the node
    * parent uint - id of node's parent
    * childs uint[] - keys of node's childs (which are in nodes map)
    */
    struct Node {      
        uint id;
        uint stake;
        address addr; 
        NodeState state;
        uint[] candidates;
        string desc;
        uint parent;
        uint[] childs;
    }

    /*
    * Candidate struct is a datastructure for candidates.
    * name string - name of candidates (for example: Apple :D)
    * stake uint - amount of stake proposed
    * addr address - ethereum addres of candidate
    */
    struct Candidate {      
        string name;
        uint stake;
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

    /** topSubProjectsNum uint - number of direct subprojects of the main project. These must all be approved */
    uint public topSubProjectsNum;
    /** approvedTopSubProjectsNum uint - number of approved subprojects */
    uint public approvedTopSubProjectsNum;


    //---------------Validators and access control functions-------------------------------------


    /** @notice Validates if 0 <= nodeId < nodeCntr
    * @param nodeId The node id to validate
    */
    function validateNodeId(uint nodeId) public view {
        require(nodeId < nodeCntr);
    }

    /** @notice Validates if 0 <= candidateId < candidateCntr
    * @param candidateId The candidate id to validate
    */
    function validateCandidateId(uint candidateId) public view {
        require(candidateId < candidateCntr);
    }

    /** @notice Requires the contract to be in a specific state
    * @param state The expected state
    */
    function requireContractState(uint state) public view {
        require(getContractState() == state);
    }

    /** @notice Requires the selected node to be in a specific state
    * @param nodeId The node Id
    * @param state The expected state of the node
    */
    function requireNodeState(uint nodeId, uint state) public view {
        require(uint(nodes[nodeId].state) == state);
    }

    /** @notice Verifies if the message sender is the owner of the node
    * @param nodeId The node Id
    */
    function requireNodeOwner(uint nodeId) public view {    
        Node memory node = nodes[nodeId];
        if (node.state == NodeState.OPEN) {
            // The node only has owner after it has been approved
            revert();
        } else {
            require(node.addr == msg.sender); 
        }
    }

    /** @notice Verifies if the message sender is the owner of the parent of the node
    * @param nodeId The node Id, whose parent will be checked
    */
    function requireNodeParent(uint nodeId) public view {    
        uint parentId = nodes[nodeId].parent;
        requireNodeOwner(parentId);
    }

    /** @notice Gets the contract's state
    */
    function getContractState() public view returns (uint state) {
        uint lockState = getLockState();
        if (lockState == uint(LockState.INVALID)) {
            return uint(ContractState.INVALID);
        } else if (lockState == uint(LockState.TENDER)) {
            return uint(ContractState.TENDER);
        } else if (lockState == uint(LockState.DELIVERY)) {
            // Check if all subproject have been approved
            if (topSubProjectsNum == approvedTopSubProjectsNum) {
                return uint(ContractState.DELIVERY);
            } else {
                return uint(ContractState.CANCELLED);
            }
        } else {
            return uint(ContractState.FINISHED);
        }
    }

    /** @notice Checks if 'stake' amount of ethereum is still available for allocation in node
    * @param stake The amount of ethereum planned to be allocated for the new node
    * @param nodeId Id of node
    */
    function validateStake(uint stake, uint nodeId) private view {
        validateNodeId(nodeId);
        uint availableStake = nodes[nodeId].stake;

        if (availableStake < stake) {
            revert();
        }
    }
    

    //--------------------------------------Update Methods------------------------------------


    /** @notice SmartBudget constructor
    * @param _tenderLockTime Tender lock time, absolute or relative
    * @param _tenderLockType Tender lock type, 0 for absolute, 1 for relative
    * @param _deliveryLockTime Delivery lock time, absolute or relative
    * @param _deliveryLockType Delivery lock type, 0 for absolute, 1 for relative
    */
    function SmartBudget(uint _tenderLockTime, uint _tenderLockType, uint _deliveryLockTime, uint _deliveryLockType, string desc) TimeLock(_tenderLockTime, _tenderLockType, _deliveryLockTime, _deliveryLockType) public payable {
        nodeCntr = 0;
        candidateCntr = 0;

        // Add the root node
        uint key = nodeCntr;
        Node memory node;
        node.id = key;
        node.stake = msg.value;
        node.addr = msg.sender;
        node.state = NodeState.COMPLETED;
        node.desc = desc;
        node.parent = key;
        nodeCntr = nodeCntr + 1;

        root = key;
        nodes[key] = node;
    } 

    /** @notice Add a new empty node
    * @param desc  Description of node
    * @param parentId Parent's id of node
    */
    function addNode(string desc, uint parentId) public {
        requireContractState(uint(ContractState.TENDER));
        validateNodeId(parentId);
        requireNodeOwner(parentId);

        Node memory node;
        uint key = nodeCntr;
        node.id = key;
        node.state = NodeState.OPEN;
        node.desc = desc;
        node.parent = parentId;
        nodeCntr = nodeCntr + 1;
        // If this is topSubProject, increment the counter
        if (parentId == root) {
            ++topSubProjectsNum;
        }
                
        nodes[key] = node;

        nodes[parentId].childs.push(key);
    }

    /** @notice Add candidate to certain node
    * @param nodeId Id of the node
    * @param name Candidate's name
    * @param stake Stake demanded by the candidate
    */
    function applyForNode(uint nodeId, string name, uint stake) public {
        requireContractState(uint(ContractState.TENDER));
        validateNodeId(nodeId);
        requireNodeState(nodeId, uint(NodeState.OPEN));
        // check the required amount of stake for node at application time
        // this way we don't allow for applications with too large demands
        Node memory node = nodes[nodeId];
        validateStake(stake, node.parent);

        Candidate memory candidate;
        candidate.name = name;
        candidate.addr = msg.sender;
        candidate.stake = stake;
        uint key = candidateCntr;
        candidates[key] = candidate;
        nodes[nodeId].candidates.push(key);
        candidateCntr = candidateCntr + 1;
    }

    /** @notice Set certain node state to APPROVED
    * @param nodeId Id of the node
    * @param candidateId Id of candidate
    */
    function approveNode(uint nodeId, uint candidateId) public {
        requireContractState(uint(ContractState.TENDER));
        validateNodeId(nodeId);
        validateCandidateId(candidateId);
        requireNodeParent(nodeId);
        requireNodeState(nodeId, uint(NodeState.OPEN));
        // check the required amount of stake for node at approval time as well
        Candidate memory candidate = candidates[candidateId];
        uint parentId = nodes[nodeId].parent;
        validateStake(candidate.stake, parentId);
        // Update the node
        nodes[nodeId].addr = candidate.addr;
        nodes[nodeId].stake = candidate.stake;
        nodes[nodeId].state = NodeState.APPROVED;
        // Update the node's parent
        nodes[parentId].stake = nodes[parentId].stake - candidate.stake;
        // If a topSubProject is approved, increment the counter
        if (parentId == root) {
            ++approvedTopSubProjectsNum;
        }
    }

    /** @notice Set certain node state to COMPLETED
    * @dev The root can mark a node as complete after the tender period
    * @param nodeId Id of the node
    */
    function markNodeComplete(uint nodeId) public {
        // Allow calling this function only after the TENDER period
        uint contractState = getContractState();
        require(contractState > uint(ContractState.TENDER));
        validateNodeId(nodeId);
        // Since the root owns all funds, he has to approve each node in the end
        requireNodeOwner(root);
        requireNodeState(nodeId, uint(NodeState.APPROVED));
        // Update the node
        nodes[nodeId].state = NodeState.COMPLETED;
    }

    //--------------------------------------Getter Methods------------------------------------


    /** @notice [web3js] Get a node by Id (id is the key in context of map)
    * @param nodeId Id of the node
    * @return {
    *   "stake" : "Stake of node",
    *   "addr" : "Address of node",
    *   "state" : "State of node",
    *   "cands" : "Array of candidate ids",
    *   "desc" : "Description of node",
    *   "parent" : "Id of parent node",
    *   "childs" : "Array of child node ids"
    * }
    */
    function getNodeWeb(uint nodeId) public view returns (uint stake, address addr, NodeState state, uint[] cands, string desc, uint parent, uint[] childs) {
        return (nodes[nodeId].stake, nodes[nodeId].addr, nodes[nodeId].state, nodes[nodeId].candidates, nodes[nodeId].desc, nodes[nodeId].parent, nodes[nodeId].childs);
    }

    /** @notice [web3js] Get all candidate addresses of nodes
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

    /** @notice Withdraw promised amount
    * @param nodeId The id of the node to retreive the promised amount from
    * @dev We require here an id to prevent the runtime scale linearly with the number of nodes. Frontend should get all node details and find the id. However, address is checked here!
    */
    function withdraw(uint nodeId) public {
        requireContractState(uint(ContractState.FINISHED));
        validateNodeId(nodeId);
        Node memory node = nodes[nodeId];
        address recipient = node.addr;
        // Check the state of the node
        NodeState nodeState = nodes[nodeId].state;
        if (nodeState == NodeState.COMPLETED) {
            // Root has marked the node complete, so the node owner may withdraw the promised amount
            requireNodeOwner(nodeId);      
        } else if (nodeState == NodeState.APPROVED) {
            // Root has not marked the node complete
            // This means the promised work has not been delivered by the node owner
            // The root may withdraw the amount promised to the node
            requireNodeOwner(root);
            recipient = nodes[root].addr;
        }
        uint amount = node.stake;
        // To prevent reentrancy attacks
        node.stake = 0;
        recipient.transfer(amount);
        node.state = NodeState.PAYED;
    }

    /** @notice Withdraw all funds from contract if the project has been cancelled
    * @dev Allows the root owner to withdraw all funds in case state is cancelled
    */
    function cancel() public {
        requireContractState(uint(ContractState.CANCELLED));
        requireNodeOwner(root);
        nodes[root].addr.transfer(address(this).balance);
    }

    /** @notice Fallback function - only callable by the owner of the contract
    * @dev Can be used to send more ether to the contract after creation
    */
    function () public payable {
        // TODO: allow post-deployment sending of funds
        revert();
    }
}