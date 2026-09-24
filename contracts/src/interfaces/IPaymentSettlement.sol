// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IPaymentSettlement
/// @notice Interface for x402 Machine Payments Protocol PaymentSettlement contract
interface IPaymentSettlement {
    enum JobStatus {
        CREATED,
        ACCEPTED,
        DELIVERED,
        CONFIRMED,
        DISPUTED,
        RESOLVED,
        CANCELLED
    }

    struct Job {
        uint256 jobId;
        uint256 posterId;
        uint256 workerId;
        uint256 amount;
        bytes32 deliverableSpec;
        bytes32 proofHash;
        uint256 challengeDeadline;
        JobStatus status;
        address disputeInitiator;
    }

    event JobCreated(uint256 indexed jobId, uint256 indexed posterId, uint256 amount, bytes32 deliverableSpec);
    event JobAccepted(uint256 indexed jobId, uint256 indexed workerId);
    event DeliverySubmitted(uint256 indexed jobId, bytes32 proofHash, uint256 challengeDeadline);
    event DeliveryConfirmed(uint256 indexed jobId, address indexed workerWallet, uint256 amount);
    event DeliveryDisputed(uint256 indexed jobId, address indexed disputer);
    event DisputeResolved(uint256 indexed jobId, uint256 indexed winnerId, uint256 indexed loserId, uint256 slashedAmount);
    event JobCancelled(uint256 indexed jobId);

    function createJob(uint256 posterId, uint256 amount, bytes32 deliverableSpec) external returns (uint256 jobId);

    function acceptJob(uint256 jobId, uint256 workerId) external;

    function submitDelivery(uint256 jobId, bytes32 proofHash) external;

    function confirmDelivery(uint256 jobId) external;

    function disputeDelivery(uint256 jobId) external;

    function resolveDispute(uint256 jobId, uint256 winnerId) external;

    function getJob(uint256 jobId) external view returns (Job memory);
}
