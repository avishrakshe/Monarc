// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IReputationRegistry
/// @notice Interface for ERC-8004 Trustless Agents Reputation Registry
interface IReputationRegistry {
    struct OutcomeRecord {
        bool success;
        uint256 counterpartyId;
        uint256 timestamp;
    }

    struct ReputationMetrics {
        uint64 successfulJobs;
        uint64 failedJobs;
        int256 nansenScore;
        uint256 lastNansenUpdate;
    }

    event OutcomeRecorded(
        uint256 indexed agentId,
        bool success,
        uint256 indexed counterpartyId,
        uint256 timestamp
    );

    event ExternalSignalUpdated(
        uint256 indexed agentId,
        int256 nansenScore,
        uint256 timestamp
    );

    function recordOutcome(uint256 agentId, bool success, uint256 counterpartyId) external;

    function updateExternalSignal(uint256 agentId, int256 nansenScore, uint256 timestamp) external;

    function getReputation(uint256 agentId) external view returns (int256 composite);

    function getMetrics(uint256 agentId) external view returns (ReputationMetrics memory);
}
