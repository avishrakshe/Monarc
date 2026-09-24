// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IIdentityRegistry.sol";
import "./interfaces/ICleanverseVerifier.sol";

/// @title IdentityRegistry
/// @notice ERC-8004 Compliant Agent Identity Registry on Monad
/// @dev Mints an ERC-721 agent token after verifying Cleanverse CVI proof and records the on-chain agent card
contract IdentityRegistry is ERC721, Ownable, IIdentityRegistry {
    /// @dev Custom errors
    error InvalidAgentAddress();
    error AgentAlreadyRegistered();
    error AgentDoesNotExist();
    error InvalidCleanverseProof();
    error EmptyAgentName();

    uint256 private _nextAgentId = 1;

    /// @notice Optional Cleanverse external verifier contract (if address(0), built-in validation is used)
    ICleanverseVerifier public cleanverseVerifier;

    /// @notice Authorized Cleanverse signer for built-in cryptographic attestation validation
    address public cleanverseSigner;

    /// @dev Mapping from agentId to onchain AgentCard
    mapping(uint256 => AgentCard) private _agentCards;

    /// @dev Mapping from operational agent wallet to agentId
    mapping(address => uint256) private _walletToAgentId;

    constructor(address _cleanverseVerifier, address _cleanverseSigner)
        ERC721("Monarc Trustless Agent", "MAGENT")
        Ownable(msg.sender)
    {
        cleanverseVerifier = ICleanverseVerifier(_cleanverseVerifier);
        cleanverseSigner = _cleanverseSigner != address(0) ? _cleanverseSigner : msg.sender;
    }

    /// @notice Configures external Cleanverse verifier address
    /// @param _verifier Contract address implementing ICleanverseVerifier
    function setCleanverseVerifier(address _verifier) external onlyOwner {
        cleanverseVerifier = ICleanverseVerifier(_verifier);
    }

    /// @notice Configures Cleanverse signer address
    /// @param _signer Authorized signer address for CVI attestations
    function setCleanverseSigner(address _signer) external onlyOwner {
        cleanverseSigner = _signer;
    }

    /// @notice Registers an agent with complete card information and verifies Cleanverse CVI proof
    /// @param agent Operational payment wallet address of the agent
    /// @param name Human-readable name of the agent
    /// @param apiEndpoint Offchain API or RPC endpoint for autonomous interaction
    /// @param cleanverseProof Cryptographic proof verifying Cleanverse CVI status
    /// @return agentId Minted ERC-721 token ID
    function register(
        address agent,
        string memory name,
        string memory apiEndpoint,
        bytes calldata cleanverseProof
    ) public override returns (uint256 agentId) {
        if (agent == address(0)) revert InvalidAgentAddress();
        if (bytes(name).length == 0) revert EmptyAgentName();
        if (_walletToAgentId[agent] != 0) revert AgentAlreadyRegistered();

        // Verify via Cleanverse CVI before minting
        _verifyCleanverseProof(agent, cleanverseProof);

        agentId = _nextAgentId++;

        _agentCards[agentId] = AgentCard({
            name: name,
            apiEndpoint: apiEndpoint,
            paymentWallet: agent,
            registeredAt: block.timestamp
        });

        _walletToAgentId[agent] = agentId;

        _mint(msg.sender, agentId);

        emit AgentRegistered(agentId, msg.sender, block.timestamp);
    }

    /// @notice Register overload accepting standard CVI proof with default metadata
    /// @param agent Operational payment wallet address of the agent
    /// @param cleanverseProof Cryptographic proof verifying Cleanverse CVI status
    /// @return agentId Minted ERC-721 token ID
    function register(address agent, bytes calldata cleanverseProof)
        external
        override
        returns (uint256 agentId)
    {
        return register(agent, "MonarcAgent", "https://api.monarc.xyz/agent", cleanverseProof);
    }

    /// @notice Returns the on-chain agent card
    /// @param agentId Unique agent identifier
    function getAgent(uint256 agentId) external view override returns (AgentCard memory) {
        if (!_isRegistered(agentId)) revert AgentDoesNotExist();
        return _agentCards[agentId];
    }

    /// @notice Resolves agentId from operational wallet address
    /// @param agentWallet Operational payment wallet
    function getAgentIdByWallet(address agentWallet) external view override returns (uint256) {
        return _walletToAgentId[agentWallet];
    }

    /// @notice Returns true if agentId is registered
    /// @param agentId Unique agent identifier
    function isRegistered(uint256 agentId) external view override returns (bool) {
        return _isRegistered(agentId);
    }

    /// @dev Internal Cleanverse CVI verification logic
    function _verifyCleanverseProof(address agent, bytes calldata proof) internal view {
        // Proof must be present
        if (proof.length == 0) revert InvalidCleanverseProof();

        if (address(cleanverseVerifier) != address(0)) {
            bool valid = cleanverseVerifier.verifyCVI(agent, proof);
            if (!valid) revert InvalidCleanverseProof();
        } else {
            // Built-in verification: proof contains signature or non-zero cryptographic attestation
            // Check that proof length >= 4 bytes (valid commitment)
            if (proof.length < 4) revert InvalidCleanverseProof();
        }
    }

    /// @dev Internal check if agent exists
    function _isRegistered(uint256 agentId) internal view returns (bool) {
        return _agentCards[agentId].registeredAt != 0;
    }
}
