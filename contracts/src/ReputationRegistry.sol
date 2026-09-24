// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IERC8004Reputation.sol";
import "./interfaces/IERC8004Identity.sol";

/// @title ReputationRegistry
/// @notice ERC-8004 Compliant Reputation Registry for Monarc on Monad
/// @dev Records immutable client feedback, verifies onchain performance, and computes reputation metrics
contract ReputationRegistry is Ownable, IERC8004Reputation {
    /// @dev Custom errors
    error InvalidScore();
    error AgentDoesNotExist();
    error UnauthorizedCaller();
    error FeedbackIndexOutOfBounds();
    error InvalidIdentityRegistry();

    IERC8004Identity public immutable identityRegistry;

    /// @dev Authorized settlement or validation contracts permitted to record verified task completions
    mapping(address => bool) public isAuthorizedReporter;

    /// @dev Mapping from agentId to list of feedbacks
    mapping(uint256 => Feedback[]) private _agentFeedbacks;

    /// @dev Mapping from agentId to aggregated summary
    mapping(uint256 => AgentReputationSummary) private _summaries;

    constructor(address _identityRegistry) Ownable(msg.sender) {
        if (_identityRegistry == address(0)) revert InvalidIdentityRegistry();
        identityRegistry = IERC8004Identity(_identityRegistry);
    }

    /// @notice Grants or revokes reporter role for PaymentSettlement or Validation contracts
    /// @param reporter Address of the reporter contract
    /// @param active Authorization status
    function setAuthorizedReporter(address reporter, bool active) external onlyOwner {
        if (reporter == address(0)) revert UnauthorizedCaller();
        isAuthorizedReporter[reporter] = active;
    }

    /// @notice Submits immutable feedback for an agent following ERC-8004
    /// @param agentId The target agent ID
    /// @param score Score between 1 and 100
    /// @param tag Short category or capability tag
    /// @param comments Client or peer comments
    /// @param jobHash Cryptographic commitment to the job or interaction
    function giveFeedback(
        uint256 agentId,
        uint8 score,
        string calldata tag,
        string calldata comments,
        bytes32 jobHash
    ) external override {
        if (!identityRegistry.isRegistered(agentId)) revert AgentDoesNotExist();
        if (score < 1 || score > 100) revert InvalidScore();

        Feedback memory feedback = Feedback({
            reviewer: msg.sender,
            score: score,
            tag: tag,
            comments: comments,
            jobHash: jobHash,
            timestamp: block.timestamp
        });

        _agentFeedbacks[agentId].push(feedback);

        AgentReputationSummary storage summary = _summaries[agentId];
        uint256 currentCount = summary.feedbackCount;
        uint64 newCount = uint64(currentCount + 1);

        // Update incremental moving average
        uint256 totalScore = (uint256(summary.averageScore) * currentCount) + score;
        summary.averageScore = uint32(totalScore / newCount);
        summary.feedbackCount = newCount;

        emit FeedbackSubmitted(agentId, msg.sender, score, tag, jobHash);
    }

    /// @notice Records onchain job completion or dispute from authorized payment contracts
    /// @param agentId The worker agent ID
    /// @param paymentAmount The value earned from the completed job
    /// @param success True if delivered successfully without dispute loss
    function recordJobCompletion(
        uint256 agentId,
        uint256 paymentAmount,
        bool success
    ) external override {
        if (!isAuthorizedReporter[msg.sender] && msg.sender != owner()) {
            revert UnauthorizedCaller();
        }
        if (!identityRegistry.isRegistered(agentId)) revert AgentDoesNotExist();

        AgentReputationSummary storage summary = _summaries[agentId];
        if (success) {
            summary.totalCompletedJobs += 1;
            summary.totalEarned += uint128(paymentAmount);
        } else {
            summary.totalDisputedJobs += 1;
        }

        emit JobSettlementRecorded(agentId, paymentAmount, success);
    }

    /// @notice Returns the aggregated reputation summary for an agent
    /// @param agentId Unique agent ID
    function getSummary(uint256 agentId) external view override returns (AgentReputationSummary memory) {
        if (!identityRegistry.isRegistered(agentId)) revert AgentDoesNotExist();
        return _summaries[agentId];
    }

    /// @notice Returns a single feedback entry by index
    /// @param agentId Unique agent ID
    /// @param index Position in feedback array
    function getFeedback(uint256 agentId, uint256 index) external view override returns (Feedback memory) {
        if (index >= _agentFeedbacks[agentId].length) revert FeedbackIndexOutOfBounds();
        return _agentFeedbacks[agentId][index];
    }

    /// @notice Returns the count of feedbacks received by an agent
    /// @param agentId Unique agent ID
    function getFeedbackCount(uint256 agentId) external view override returns (uint256) {
        return _agentFeedbacks[agentId].length;
    }
}
