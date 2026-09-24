// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IPaymentSettlement
/// @notice Machine Payments Protocol (x402) interface for agent-to-agent escrow and optimistic settlement
interface IPaymentSettlement {
    enum JobStatus {
        CREATED,
        ACCEPTED,
        DELIVERED,
        SETTLED,
        DISPUTED,
        RESOLVED,
        CANCELLED
    }

    struct Job {
        uint256 jobId;
        uint256 employerAgentId;
        uint256 workerAgentId;
        address employerWallet;
        address workerWallet;
        uint256 paymentAmount;
        uint256 workerStakeRequired;
        uint256 workerStakeDeposited;
        uint256 challengePeriodSeconds;
        uint256 challengeDeadline;
        bytes32 jobSpecHash;
        bytes32 deliveryHash;
        string deliveryURI;
        JobStatus status;
        address disputeInitiator;
    }

    event JobCreated(
        uint256 indexed jobId,
        uint256 indexed employerAgentId,
        uint256 indexed workerAgentId,
        uint256 paymentAmount,
        uint256 workerStakeRequired,
        uint256 challengePeriodSeconds
    );

    event JobAccepted(uint256 indexed jobId, uint256 indexed workerAgentId, uint256 stakeDeposited);
    event DeliverySubmitted(uint256 indexed jobId, bytes32 deliveryHash, string deliveryURI, uint256 challengeDeadline);
    event JobSettled(uint256 indexed jobId, address indexed workerWallet, uint256 totalPayout);
    event DisputeRaised(uint256 indexed jobId, address indexed disputer, string reason);
    event DisputeResolved(uint256 indexed jobId, bool favorWorker, string resolutionNotes);
    event JobCancelled(uint256 indexed jobId);

    function createJob(
        uint256 employerAgentId,
        uint256 workerAgentId,
        uint256 workerStakeRequired,
        uint256 challengePeriodSeconds,
        bytes32 jobSpecHash
    ) external payable returns (uint256 jobId);

    function acceptJob(uint256 jobId) external payable;
    function submitDelivery(uint256 jobId, bytes32 deliveryHash, string calldata deliveryURI) external;
    function claimPayment(uint256 jobId) external;
    function raiseDispute(uint256 jobId, string calldata reason) external;
    function resolveDispute(uint256 jobId, bool favorWorker, string calldata resolutionNotes) external;
    function cancelJob(uint256 jobId) external;
    function getJob(uint256 jobId) external view returns (Job memory);
}
