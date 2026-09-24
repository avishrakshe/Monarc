// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IReputationRegistry.sol";
import "./interfaces/IIdentityRegistry.sol";

/// @title ReputationRegistry
/// @notice ERC-8004 Compliant Reputation Registry on Monad
/// @dev Records immutable job outcomes from PaymentSettlement and external signals from Nansen on-chain intelligence
contract ReputationRegistry is Ownable, IReputationRegistry {
    /// @dev Custom errors
    error UnauthorizedPaymentSettlement();
    error UnauthorizedSignalWriter();
    error AgentDoesNotExist();
    error InvalidIdentityRegistry();
    error InvalidTimestamp();

    IIdentityRegistry public immutable identityRegistry;

    /// @notice Authorized PaymentSettlement contract allowed to call recordOutcome
    address public paymentSettlement;

    /// @notice Authorized permissioned writer for Nansen onchain intelligence signals
    address public nansenSignalWriter;

    /// @dev Mapping from agentId to metrics
    mapping(uint256 => ReputationMetrics) private _metrics;

    /// @dev Mapping from agentId to list of outcomes (immutable history per ERC-8004)
    mapping(uint256 => OutcomeRecord[]) private _outcomes;

    constructor(address _identityRegistry, address _nansenSignalWriter) Ownable(msg.sender) {
        if (_identityRegistry == address(0)) revert InvalidIdentityRegistry();
        identityRegistry = IIdentityRegistry(_identityRegistry);
        nansenSignalWriter = _nansenSignalWriter != address(0) ? _nansenSignalWriter : msg.sender;
    }

    /// @notice Sets the authorized PaymentSettlement contract
    /// @param _paymentSettlement Address of the PaymentSettlement contract
    function setPaymentSettlement(address _paymentSettlement) external onlyOwner {
        paymentSettlement = _paymentSettlement;
    }

    /// @notice Sets the authorized Nansen external signal writer
    /// @param _writer Address of the Nansen intelligence writer
    function setNansenSignalWriter(address _writer) external onlyOwner {
        nansenSignalWriter = _writer;
    }

    /// @notice Records an immutable job outcome per ERC-8004
    /// @dev Callable ONLY by the authorized PaymentSettlement contract
    /// @param agentId The worker or participant agent ID
    /// @param success True if delivered successfully without dispute loss
    /// @param counterpartyId The hiring or counterpart agent ID
    function recordOutcome(
        uint256 agentId,
        bool success,
        uint256 counterpartyId
    ) external override {
        if (msg.sender != paymentSettlement && msg.sender != owner()) {
            revert UnauthorizedPaymentSettlement();
        }
        if (!identityRegistry.isRegistered(agentId)) revert AgentDoesNotExist();

        ReputationMetrics storage m = _metrics[agentId];
        if (success) {
            m.successfulJobs += 1;
        } else {
            m.failedJobs += 1;
        }

        _outcomes[agentId].push(OutcomeRecord({
            success: success,
            counterpartyId: counterpartyId,
            timestamp: block.timestamp
        }));

        emit OutcomeRecorded(agentId, success, counterpartyId, block.timestamp);
    }

    /// @notice Updates external reputation signals fed by Nansen onchain intelligence
    /// @dev Permissioned writer role
    /// @param agentId The target agent ID
    /// @param nansenScore Real-time onchain score from Nansen intelligence (e.g. 0 to 100)
    /// @param timestamp Attestation timestamp
    function updateExternalSignal(
        uint256 agentId,
        int256 nansenScore,
        uint256 timestamp
    ) external override {
        if (msg.sender != nansenSignalWriter && msg.sender != owner()) {
            revert UnauthorizedSignalWriter();
        }
        if (!identityRegistry.isRegistered(agentId)) revert AgentDoesNotExist();
        if (timestamp == 0 || timestamp > block.timestamp + 300) revert InvalidTimestamp();

        ReputationMetrics storage m = _metrics[agentId];
        m.nansenScore = nansenScore;
        m.lastNansenUpdate = timestamp;

        emit ExternalSignalUpdated(agentId, nansenScore, timestamp);
    }

    /// @notice Computes and returns the composite reputation score for an agent
    /// @param agentId Unique agent identifier
    /// @return composite Weighted reputation score combining onchain track record and Nansen signal
    function getReputation(uint256 agentId) external view override returns (int256 composite) {
        if (!identityRegistry.isRegistered(agentId)) revert AgentDoesNotExist();

        ReputationMetrics memory m = _metrics[agentId];

        // Base score = 100, +50 per success, -150 per failure, + (nansenScore * 5)
        int256 base = 100;
        int256 onchainComponent = (int256(uint256(m.successfulJobs)) * 50) - (int256(uint256(m.failedJobs)) * 150);
        int256 nansenComponent = m.nansenScore * 5;

        composite = base + onchainComponent + nansenComponent;
    }

    /// @notice Returns raw metrics for an agent
    /// @param agentId Unique agent identifier
    function getMetrics(uint256 agentId) external view override returns (ReputationMetrics memory) {
        if (!identityRegistry.isRegistered(agentId)) revert AgentDoesNotExist();
        return _metrics[agentId];
    }
}
