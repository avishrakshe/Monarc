// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IERC8004Identity.sol";

/// @title IdentityRegistry
/// @notice ERC-8004 Compliant Agent Identity Registry for Monarc on Monad
/// @dev Mints an ERC-721 token representing verified agent identity and stores metadata & verification badges
contract IdentityRegistry is ERC721, Ownable, IERC8004Identity {
    /// @dev Custom errors
    error InvalidWalletAddress();
    error AgentAlreadyRegistered();
    error AgentDoesNotExist();
    error NotAgentOwner();
    error UnauthorizedVerifier();
    error EmptyMetadataURI();

    uint256 private _nextAgentId = 1;

    /// @dev Mapping from agent token ID to Agent data
    mapping(uint256 => Agent) private _agents;

    /// @dev Mapping from agent operational wallet address to agentId
    mapping(address => uint256) private _walletToAgentId;

    /// @dev Authorized Cleanverse identity verifiers
    mapping(address => bool) public isAuthorizedVerifier;

    constructor() ERC721("Monarc Agent Identity", "MAGENT") Ownable(msg.sender) {
        // Deployer is initial verifier
        isAuthorizedVerifier[msg.sender] = true;
    }

    /// @notice Authorizes or revokes a Cleanverse verifier address
    /// @param verifier Address of the verification signer / oracle
    /// @param active Authorization status
    function setAuthorizedVerifier(address verifier, bool active) external onlyOwner {
        if (verifier == address(0)) revert InvalidWalletAddress();
        isAuthorizedVerifier[verifier] = active;
    }

    /// @notice Registers a new autonomous agent under ERC-8004
    /// @param agentCardURI Offchain IPFS/HTTPS metadata URI containing agent card specification
    /// @param walletAddress The operational wallet address used by the autonomous agent to sign and receive funds
    /// @return agentId The minted ERC-721 token ID representing the agent
    function registerAgent(
        string calldata agentCardURI,
        address walletAddress
    ) external override returns (uint256 agentId) {
        if (bytes(agentCardURI).length == 0) revert EmptyMetadataURI();
        if (walletAddress == address(0)) revert InvalidWalletAddress();
        if (_walletToAgentId[walletAddress] != 0) revert AgentAlreadyRegistered();

        agentId = _nextAgentId++;

        _agents[agentId] = Agent({
            owner: msg.sender,
            walletAddress: walletAddress,
            agentCardURI: agentCardURI,
            isCleanverseVerified: false,
            registeredAt: block.timestamp
        });

        _walletToAgentId[walletAddress] = agentId;

        _safeMint(msg.sender, agentId);

        emit AgentRegistered(agentId, msg.sender, walletAddress, agentCardURI);
    }

    /// @notice Updates the agent card metadata URI
    /// @param agentId The unique agent ID
    /// @param newURI The updated agent card URI
    function setAgentCardURI(uint256 agentId, string calldata newURI) external override {
        if (!_isAgentRegistered(agentId)) revert AgentDoesNotExist();
        if (ownerOf(agentId) != msg.sender && _agents[agentId].walletAddress != msg.sender) {
            revert NotAgentOwner();
        }
        if (bytes(newURI).length == 0) revert EmptyMetadataURI();

        _agents[agentId].agentCardURI = newURI;
        emit AgentCardUpdated(agentId, newURI);
    }

    /// @notice Attests Cleanverse verified identity status for an agent
    /// @param agentId The unique agent ID
    /// @param verified Verification badge status
    function setCleanverseVerified(uint256 agentId, bool verified) external override {
        if (!isAuthorizedVerifier[msg.sender] && msg.sender != owner()) {
            revert UnauthorizedVerifier();
        }
        if (!_isAgentRegistered(agentId)) revert AgentDoesNotExist();

        _agents[agentId].isCleanverseVerified = verified;
        emit CleanverseVerificationUpdated(agentId, verified);
    }

    /// @notice Returns the agent metadata struct
    /// @param agentId The unique agent ID
    function getAgent(uint256 agentId) external view override returns (Agent memory) {
        if (!_isAgentRegistered(agentId)) revert AgentDoesNotExist();
        return _agents[agentId];
    }

    /// @notice Resolves an agent ID from its operating wallet address
    /// @param walletAddress Agent wallet address
    function getAgentIdByWallet(address walletAddress) external view override returns (uint256) {
        return _walletToAgentId[walletAddress];
    }

    /// @notice Checks if an agent is registered
    /// @param agentId Unique identifier
    function isRegistered(uint256 agentId) external view override returns (bool) {
        return _isAgentRegistered(agentId);
    }

    /// @notice Returns ERC-721 token URI as the ERC-8004 agent card URI
    /// @param tokenId The unique agent token ID
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _agents[tokenId].agentCardURI;
    }

    /// @dev Internal check if agent exists
    function _isAgentRegistered(uint256 agentId) internal view returns (bool) {
        return _agents[agentId].owner != address(0);
    }
}
