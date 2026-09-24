// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IERC8004Validation.sol";
import "./interfaces/IERC8004Identity.sol";

/// @title ValidationRegistry
/// @notice ERC-8004 Compliant Delivery Validation Registry for Monarc on Monad
/// @dev Enables designated oracles or automated verifiers to submit verifiable delivery attestations
contract ValidationRegistry is Ownable, IERC8004Validation {
    /// @dev Custom errors
    error UnauthorizedValidator();
    error InvalidIdentityRegistry();
    error AgentDoesNotExist();
    error EmptyDeliveryHash();
    error AttestationAlreadyExists();
    error AttestationNotFound();

    IERC8004Identity public immutable identityRegistry;

    /// @dev Authorized automated validators / oracles
    mapping(address => bool) public authorizedValidators;

    /// @dev Mapping from deliveryHash to attestation record
    mapping(bytes32 => ValidationAttestation) private _attestations;

    constructor(address _identityRegistry) Ownable(msg.sender) {
        if (_identityRegistry == address(0)) revert InvalidIdentityRegistry();
        identityRegistry = IERC8004Identity(_identityRegistry);
        authorizedValidators[msg.sender] = true;
    }

    /// @notice Grants or revokes validator status
    /// @param validator Validator address
    /// @param active Active state
    function setValidator(address validator, bool active) external onlyOwner {
        authorizedValidators[validator] = active;
    }

    /// @notice Submits a verifiable validation attestation for a job delivery
    /// @param agentId Worker agent ID
    /// @param deliveryHash Cryptographic commitment of the delivery
    /// @param passed Whether delivery passed automated test validation
    /// @param reportURI Verification report location
    function attestValidation(
        uint256 agentId,
        bytes32 deliveryHash,
        bool passed,
        string calldata reportURI
    ) external override {
        if (!authorizedValidators[msg.sender] && msg.sender != owner()) {
            revert UnauthorizedValidator();
        }
        if (!identityRegistry.isRegistered(agentId)) revert AgentDoesNotExist();
        if (deliveryHash == bytes32(0)) revert EmptyDeliveryHash();
        if (_attestations[deliveryHash].timestamp != 0) revert AttestationAlreadyExists();

        _attestations[deliveryHash] = ValidationAttestation({
            validator: msg.sender,
            agentId: agentId,
            deliveryHash: deliveryHash,
            passed: passed,
            reportURI: reportURI,
            timestamp: block.timestamp
        });

        emit ValidationAttested(msg.sender, agentId, deliveryHash, passed, reportURI);
    }

    /// @notice Returns validation record for a given delivery hash
    /// @param deliveryHash Delivery hash
    function getValidation(bytes32 deliveryHash) external view override returns (ValidationAttestation memory) {
        if (_attestations[deliveryHash].timestamp == 0) revert AttestationNotFound();
        return _attestations[deliveryHash];
    }

    /// @notice Checks if address is authorized validator
    /// @param account Address to check
    function isValidator(address account) external view override returns (bool) {
        return authorizedValidators[account] || account == owner();
    }
}
