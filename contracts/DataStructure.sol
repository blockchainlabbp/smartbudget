pragma solidity ^0.4.2;

contract DataStructure {

    struct Node {
        address id;
        uint stake;
        string desc;
        address parentId;
    }

    Node[] nodes;

    uint numOfNodes;

    address[] ids;
    uint[] stakes;
    string[] descriptions;
    address[] parentIds;

    function DataStructure() public {
        numOfNodes = 0;
    }    

    function addRoot(uint stake, string desc) public {
        
        nodes.push(Node(msg.sender, stake, desc, msg.sender));

        ids.push(msg.sender);
        stakes.push(stake);
        descriptions.push(desc);
        parentIds.push(msg.sender);
        
        numOfNodes = numOfNodes + 1;
    }

    function getIds() public view returns (address[] _ids) {
        return ids;
    }

    function getNodes() public view returns (address[] _ids, uint[] _stakes, address[] _parentIds) {
        return(ids, stakes, parentIds);
    }

    function addChild(uint stake, string desc, address parentId) public {
        nodes.push(Node(msg.sender, stake, desc, parentId));

        ids.push(msg.sender);
        stakes.push(stake);
        descriptions.push(desc);
        parentIds.push(parentId);

        numOfNodes = numOfNodes + 1;
    }

    function getNodeDesc(uint index) public view returns (string desc) {
        return descriptions[index];
    }
}