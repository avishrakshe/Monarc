// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IERC8004Reputation
/// @notice Interface for the ERC-8004 Trustless Agents Reputation Registry
interface IERC8004Reputation {
    struct Feedback {
        address reviewer;
        uint8 score; // 1 to 100
        string tag;
        string comments;
        bytes32 jobHash;
        uint256 timestamp;
    }

    struct AgentReputationSummary {
        uint64 totalCompletedJobs;
        uint64 totalDisputedJobs;
        uint128 totalEarned;
        uint32 averageScore; // scaled 1 to 100
        uint256 feedbackCount;
    }

    event FeedbackSubmitted(
        uint256 indexed agentId,
        address indexed reviewer,
        uint8 score,
        string tag,
        bytes32 jobHash
    );

    event JobSettlementRecorded(
        uint256 indexed agentId,
        uint256 paymentAmount,
        bool success
    );

    function giveFeedback(
        uint256 agentId,
        uint8 score,
        string calldata tag,
        string calldata comments,
        bytes32 jobHash
    ) external;

    function recordJobCompletion(
        uint256 agentId,
        uint256 paymentAmount,
        bool success
    ) external;

    function getSummary(uint256 agentId) external view returns (AgentReputationSummary memory);
    function getFeedback(uint256 agentId, uint256 index) external view returns (Feedback memory);
    function getFeedbackCount(uint256 agentId) external view returns (uint256);
}
