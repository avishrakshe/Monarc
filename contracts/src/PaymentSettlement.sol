// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IPaymentSettlement.sol";
import "./interfaces/IERC8004Identity.sol";
import "./interfaces/IERC8004Reputation.sol";

/// @title PaymentSettlement
/// @notice Machine Payments Protocol (x402) for Autonomous Agent Escrow on Monad
/// @dev Implements optimistic settlement with a fixed challenge window (default 120s) and single-resolver MVP arbitration
contract PaymentSettlement is Ownable, ReentrancyGuard, IPaymentSettlement {
    /// @dev Custom errors
    error InvalidIdentityRegistry();
    error InvalidReputationRegistry();
    error InvalidResolverAddress();
    error InvalidPaymentAmount();
    error InvalidAgentId();
    error UnauthorizedAgent();
    error InsufficientWorkerStake();
    error InvalidJobState();
    error ChallengePeriodNotElapsed();
    error ChallengePeriodElapsed();
    error TransferFailed();
    error OnlyDisputeResolver();
    error EmptyDeliveryHash();
    error EmptyJobSpec();

    IERC8004Identity public immutable identityRegistry;
    IERC8004Reputation public immutable reputationRegistry;

    /// @notice Address authorized to resolve disputed escrows (MVP single resolver)
    address public disputeResolver;

    /// @notice Default optimistic challenge duration in seconds (120s for real-time Monad settlement)
    uint256 public defaultChallengePeriod = 120 seconds;

    uint256 private _nextJobId = 1;
    mapping(uint256 => Job) private _jobs;

    constructor(
        address _identityRegistry,
        address _reputationRegistry,
        address _disputeResolver
    ) Ownable(msg.sender) {
        if (_identityRegistry == address(0)) revert InvalidIdentityRegistry();
        if (_reputationRegistry == address(0)) revert InvalidReputationRegistry();
        if (_disputeResolver == address(0)) revert InvalidResolverAddress();

        identityRegistry = IERC8004Identity(_identityRegistry);
        reputationRegistry = IERC8004Reputation(_reputationRegistry);
        disputeResolver = _disputeResolver;
    }

    /// @notice Updates the single dispute resolver address
    /// @param newResolver New resolver address
    function setDisputeResolver(address newResolver) external onlyOwner {
        if (newResolver == address(0)) revert InvalidResolverAddress();
        disputeResolver = newResolver;
    }

    /// @notice Updates the default optimistic challenge period
    /// @param newPeriod Challenge window in seconds
    function setDefaultChallengePeriod(uint256 newPeriod) external onlyOwner {
        defaultChallengePeriod = newPeriod;
    }

    /// @notice Creates an escrow job with payment locked in Monad native MON
    /// @param employerAgentId Agent ID of hiring entity
    /// @param workerAgentId Agent ID of worker entity
    /// @param workerStakeRequired Collateral required from worker to accept
    /// @param challengePeriodSeconds Challenge duration (0 uses default 120s)
    /// @param jobSpecHash Commitment hash of work specification
    /// @return jobId The created job ID
    function createJob(
        uint256 employerAgentId,
        uint256 workerAgentId,
        uint256 workerStakeRequired,
        uint256 challengePeriodSeconds,
        bytes32 jobSpecHash
    ) external payable override nonReentrant returns (uint256 jobId) {
        if (msg.value == 0) revert InvalidPaymentAmount();
        if (jobSpecHash == bytes32(0)) revert EmptyJobSpec();
        if (!identityRegistry.isRegistered(employerAgentId)) revert InvalidAgentId();
        if (!identityRegistry.isRegistered(workerAgentId)) revert InvalidAgentId();

        IERC8004Identity.Agent memory employer = identityRegistry.getAgent(employerAgentId);
        IERC8004Identity.Agent memory worker = identityRegistry.getAgent(workerAgentId);

        if (msg.sender != employer.owner && msg.sender != employer.walletAddress) {
            revert UnauthorizedAgent();
        }

        uint256 window = challengePeriodSeconds == 0 ? defaultChallengePeriod : challengePeriodSeconds;

        jobId = _nextJobId++;

        _jobs[jobId] = Job({
            jobId: jobId,
            employerAgentId: employerAgentId,
            workerAgentId: workerAgentId,
            employerWallet: employer.walletAddress,
            workerWallet: worker.walletAddress,
            paymentAmount: msg.value,
            workerStakeRequired: workerStakeRequired,
            workerStakeDeposited: 0,
            challengePeriodSeconds: window,
            challengeDeadline: 0,
            jobSpecHash: jobSpecHash,
            deliveryHash: bytes32(0),
            deliveryURI: "",
            status: JobStatus.CREATED,
            disputeInitiator: address(0)
        });

        emit JobCreated(
            jobId,
            employerAgentId,
            workerAgentId,
            msg.value,
            workerStakeRequired,
            window
        );
    }

    /// @notice Worker agent accepts job and locks required collateral stake
    /// @param jobId Job identifier
    function acceptJob(uint256 jobId) external payable override nonReentrant {
        Job storage job = _jobs[jobId];
        if (job.status != JobStatus.CREATED) revert InvalidJobState();

        IERC8004Identity.Agent memory worker = identityRegistry.getAgent(job.workerAgentId);
        if (msg.sender != worker.owner && msg.sender != worker.walletAddress) {
            revert UnauthorizedAgent();
        }
        if (msg.value < job.workerStakeRequired) revert InsufficientWorkerStake();

        job.workerStakeDeposited = msg.value;
        job.status = JobStatus.ACCEPTED;

        emit JobAccepted(jobId, job.workerAgentId, msg.value);
    }

    /// @notice Worker agent delivers work, starting the optimistic challenge countdown
    /// @param jobId Job identifier
    /// @param deliveryHash Cryptographic commitment of the delivery payload
    /// @param deliveryURI Offchain URI detailing results / deliverables
    function submitDelivery(
        uint256 jobId,
        bytes32 deliveryHash,
        string calldata deliveryURI
    ) external override nonReentrant {
        Job storage job = _jobs[jobId];
        if (job.status != JobStatus.ACCEPTED) revert InvalidJobState();
        if (deliveryHash == bytes32(0)) revert EmptyDeliveryHash();

        IERC8004Identity.Agent memory worker = identityRegistry.getAgent(job.workerAgentId);
        if (msg.sender != worker.owner && msg.sender != worker.walletAddress) {
            revert UnauthorizedAgent();
        }

        uint256 deadline = block.timestamp + job.challengePeriodSeconds;
        job.deliveryHash = deliveryHash;
        job.deliveryURI = deliveryURI;
        job.challengeDeadline = deadline;
        job.status = JobStatus.DELIVERED;

        emit DeliverySubmitted(jobId, deliveryHash, deliveryURI, deadline);
    }

    /// @notice Auto-releases funds to worker if challenge period elapsed without dispute
    /// @param jobId Job identifier
    function claimPayment(uint256 jobId) external override nonReentrant {
        Job storage job = _jobs[jobId];
        if (job.status != JobStatus.DELIVERED) revert InvalidJobState();
        if (block.timestamp < job.challengeDeadline) revert ChallengePeriodNotElapsed();

        job.status = JobStatus.SETTLED;

        uint256 totalPayout = job.paymentAmount + job.workerStakeDeposited;
        address destination = job.workerWallet;

        // Record reputation
        reputationRegistry.recordJobCompletion(job.workerAgentId, job.paymentAmount, true);

        emit JobSettled(jobId, destination, totalPayout);

        (bool success, ) = destination.call{value: totalPayout}("");
        if (!success) revert TransferFailed();
    }

    /// @notice Raises a dispute within the challenge window
    /// @param jobId Job identifier
    /// @param reason Statement explaining why dispute was raised
    function raiseDispute(uint256 jobId, string calldata reason) external override nonReentrant {
        Job storage job = _jobs[jobId];
        if (job.status != JobStatus.DELIVERED && job.status != JobStatus.ACCEPTED) {
            revert InvalidJobState();
        }

        IERC8004Identity.Agent memory employer = identityRegistry.getAgent(job.employerAgentId);
        IERC8004Identity.Agent memory worker = identityRegistry.getAgent(job.workerAgentId);

        bool isEmployer = (msg.sender == employer.owner || msg.sender == employer.walletAddress);
        bool isWorker = (msg.sender == worker.owner || msg.sender == worker.walletAddress);

        if (!isEmployer && !isWorker) revert UnauthorizedAgent();

        if (job.status == JobStatus.DELIVERED && block.timestamp >= job.challengeDeadline) {
            revert ChallengePeriodElapsed();
        }

        job.status = JobStatus.DISPUTED;
        job.disputeInitiator = msg.sender;

        emit DisputeRaised(jobId, msg.sender, reason);
    }

    /// @notice Resolves dispute manually (MVP single resolver) and slashes the losing party
    /// @param jobId Job identifier
    /// @param favorWorker True if worker fulfilled requirements; false if employer prevails
    /// @param resolutionNotes Details explaining arbitration ruling
    function resolveDispute(
        uint256 jobId,
        bool favorWorker,
        string calldata resolutionNotes
    ) external override nonReentrant {
        if (msg.sender != disputeResolver) revert OnlyDisputeResolver();

        Job storage job = _jobs[jobId];
        if (job.status != JobStatus.DISPUTED) revert InvalidJobState();

        job.status = JobStatus.RESOLVED;

        emit DisputeResolved(jobId, favorWorker, resolutionNotes);

        if (favorWorker) {
            // Worker vindicated: receives escrow + collateral returned
            uint256 totalPayout = job.paymentAmount + job.workerStakeDeposited;
            address workerDestination = job.workerWallet;

            reputationRegistry.recordJobCompletion(job.workerAgentId, job.paymentAmount, true);

            (bool success, ) = workerDestination.call{value: totalPayout}("");
            if (!success) revert TransferFailed();
        } else {
            // Employer prevails: gets refunded escrow + worker collateral slashed as compensation
            uint256 totalRefund = job.paymentAmount + job.workerStakeDeposited;
            address employerDestination = job.employerWallet;

            // Worker reputation penalized
            reputationRegistry.recordJobCompletion(job.workerAgentId, 0, false);

            (bool success, ) = employerDestination.call{value: totalRefund}("");
            if (!success) revert TransferFailed();
        }
    }

    /// @notice Cancels job and returns escrow if not yet accepted
    /// @param jobId Job identifier
    function cancelJob(uint256 jobId) external override nonReentrant {
        Job storage job = _jobs[jobId];
        if (job.status != JobStatus.CREATED) revert InvalidJobState();

        IERC8004Identity.Agent memory employer = identityRegistry.getAgent(job.employerAgentId);
        if (msg.sender != employer.owner && msg.sender != employer.walletAddress) {
            revert UnauthorizedAgent();
        }

        job.status = JobStatus.CANCELLED;
        uint256 refundAmount = job.paymentAmount;

        emit JobCancelled(jobId);

        (bool success, ) = job.employerWallet.call{value: refundAmount}("");
        if (!success) revert TransferFailed();
    }

    /// @notice Returns full job details
    /// @param jobId Job identifier
    function getJob(uint256 jobId) external view override returns (Job memory) {
        return _jobs[jobId];
    }
}
