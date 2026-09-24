// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/// @title IIdentityRegistry
/// @notice Interface for ERC-8004 Trustless Agents Identity Registry
interface IIdentityRegistry is IERC721 {
    struct AgentCard {
        string name;
        string apiEndpoint;
        address paymentWallet;
        uint256 registeredAt;
    }

    event AgentRegistered(uint256 indexed agentId, address indexed owner, uint256 verifiedAt);

    function register(
        address agent,
        string memory name,
        string memory apiEndpoint,
        bytes calldata cleanverseProof
    ) external returns (uint256 agentId);

    function register(address agent, bytes calldata cleanverseProof) external returns (uint256 agentId);

    function getAgent(uint256 agentId) external view returns (AgentCard memory);

    function getAgentIdByWallet(address agentWallet) external view returns (uint256);

    function isRegistered(uint256 agentId) external view returns (bool);
}
