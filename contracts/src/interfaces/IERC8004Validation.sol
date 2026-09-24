// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IERC8004Validation
/// @notice Interface for the ERC-8004 Validation Registry for delivery attestations
interface IERC8004Validation {
    struct ValidationAttestation {
        address validator;
        uint256 agentId;
        bytes32 deliveryHash;
        bool passed;
        string reportURI;
        uint256 timestamp;
    }

    event ValidationAttested(
        address indexed validator,
        uint256 indexed agentId,
        bytes32 indexed deliveryHash,
        bool passed,
        string reportURI
    );

    function attestValidation(
        uint256 agentId,
        bytes32 deliveryHash,
        bool passed,
        string calldata reportURI
    ) external;

    function getValidation(bytes32 deliveryHash) external view returns (ValidationAttestation memory);
    function isValidator(address account) external view returns (bool);
}
