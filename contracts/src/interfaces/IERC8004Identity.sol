// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/// @title IERC8004Identity
/// @notice Interface for the ERC-8004 Trustless Agents Identity Registry
interface IERC8004Identity is IERC721 {
    struct Agent {
        address owner;
        address walletAddress;
        string agentCardURI;
        bool isCleanverseVerified;
        uint256 registeredAt;
    }

    event AgentRegistered(
        uint256 indexed agentId,
        address indexed owner,
        address indexed walletAddress,
        string agentCardURI
    );

    event AgentCardUpdated(uint256 indexed agentId, string newURI);
    event CleanverseVerificationUpdated(uint256 indexed agentId, bool verified);

    function registerAgent(string calldata agentCardURI, address walletAddress) external returns (uint256 agentId);
    function setAgentCardURI(uint256 agentId, string calldata newURI) external;
    function setCleanverseVerified(uint256 agentId, bool verified) external;
    function getAgent(uint256 agentId) external view returns (Agent memory);
    function getAgentIdByWallet(address walletAddress) external view returns (uint256 agentId);
    function isRegistered(uint256 agentId) external view returns (bool);
}
