// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IPaymentSettlement.sol";
import "./interfaces/IIdentityRegistry.sol";
import "./interfaces/IReputationRegistry.sol";
import "./interfaces/IStakeManager.sol";

/// @title PaymentSettlement
/// @notice Machine Payments Protocol (x402) for Autonomous Agent Escrow on Monad
/// @dev Escrows stablecoin with 120s optimistic challenge window and resolver-only dispute slashing
contract PaymentSettlement is Ownable, ReentrancyGuard, IPaymentSettlement {
    using SafeERC20 for IERC20;

    /// @dev Custom errors
    error InvalidIdentityRegistry();
    error InvalidReputationRegistry();
    error InvalidStakeManager();
    error InvalidPaymentToken();
    error InvalidResolverAddress();
    error InvalidAmount();
    error EmptyDeliverableSpec();
    error EmptyProofHash();
    error AgentDoesNotExist();
    error UnauthorizedAgent();
    error InvalidJobState();
    error ChallengePeriodNotElapsed();
    error ChallengePeriodElapsed();
    error OnlyDisputeResolver();
    error OnlyPoster();
    error OnlyWorker();
    error InvalidWinnerId();

    IERC20 public immutable paymentToken;
    IIdentityRegistry public immutable identityRegistry;
    IReputationRegistry public immutable reputationRegistry;
    IStakeManager public immutable stakeManager;

    /// @notice Address authorized to resolve disputed deliveries
    address public disputeResolver;

    /// @notice Fixed challenge duration (default: 120s for real-time Monad settlement)
    uint256 public challengeWindow = 120 seconds;

    /// @notice Default slash percentage (in basis points) or fixed slash amount for dispute losses
    uint256 public disputeSlashBps = 2000; // 20% of job value slashed from loser collateral

    uint256 private _nextJobId = 1;
    mapping(uint256 => Job) private _jobs;

    constructor(
        address _paymentToken,
        address _identityRegistry,
        address _reputationRegistry,
        address _stakeManager,
        address _disputeResolver
    ) Ownable(msg.sender) {
        if (_paymentToken == address(0)) revert InvalidPaymentToken();
        if (_identityRegistry == address(0)) revert InvalidIdentityRegistry();
        if (_reputationRegistry == address(0)) revert InvalidReputationRegistry();
        if (_stakeManager == address(0)) revert InvalidStakeManager();
        if (_disputeResolver == address(0)) revert InvalidResolverAddress();

        paymentToken = IERC20(_paymentToken);
        identityRegistry = IIdentityRegistry(_identityRegistry);
        reputationRegistry = IReputationRegistry(_reputationRegistry);
        stakeManager = IStakeManager(_stakeManager);
        disputeResolver = _disputeResolver;
    }

    /// @notice Updates the single dispute resolver address
    /// @param _resolver New resolver address
    function setDisputeResolver(address _resolver) external onlyOwner {
        if (_resolver == address(0)) revert InvalidResolverAddress();
        disputeResolver = _resolver;
    }

    /// @notice Updates the optimistic challenge window duration
    /// @param _window Duration in seconds
    function setChallengeWindow(uint256 _window) external onlyOwner {
        challengeWindow = _window;
    }

    /// @notice Creates an escrow job with payment locked in stablecoin (x402 protocol)
    /// @param posterId Agent ID of hiring entity
    /// @param amount Amount of stablecoin to escrow
    /// @param deliverableSpec Cryptographic commitment of work requirements
    /// @return jobId The created job ID
    function createJob(
        uint256 posterId,
        uint256 amount,
        bytes32 deliverableSpec
    ) external override nonReentrant returns (uint256 jobId) {
        if (amount == 0) revert InvalidAmount();
        if (deliverableSpec == bytes32(0)) revert EmptyDeliverableSpec();
        _checkAgentAuthority(posterId);

        jobId = _nextJobId++;

        _jobs[jobId] = Job({
            jobId: jobId,
            posterId: posterId,
            workerId: 0,
            amount: amount,
            deliverableSpec: deliverableSpec,
            proofHash: bytes32(0),
            challengeDeadline: 0,
            status: JobStatus.CREATED,
            disputeInitiator: address(0)
        });

        emit JobCreated(jobId, posterId, amount, deliverableSpec);

        paymentToken.safeTransferFrom(msg.sender, address(this), amount);
    }

    /// @notice Worker agent accepts the open job
    /// @param jobId Job identifier
    /// @param workerId Agent ID of accepting worker
    function acceptJob(uint256 jobId, uint256 workerId) external override nonReentrant {
        Job storage job = _jobs[jobId];
        if (job.status != JobStatus.CREATED) revert InvalidJobState();
        _checkAgentAuthority(workerId);

        job.workerId = workerId;
        job.status = JobStatus.ACCEPTED;

        emit JobAccepted(jobId, workerId);
    }

    /// @notice Worker agent submits delivery proof, initiating the 120s challenge countdown
    /// @param jobId Job identifier
    /// @param proofHash Cryptographic hash commitment of delivery
    function submitDelivery(uint256 jobId, bytes32 proofHash) external override nonReentrant {
        Job storage job = _jobs[jobId];
        if (job.status != JobStatus.ACCEPTED) revert InvalidJobState();
        if (proofHash == bytes32(0)) revert EmptyProofHash();
        _checkAgentAuthority(job.workerId);

        uint256 deadline = block.timestamp + challengeWindow;
        job.proofHash = proofHash;
        job.challengeDeadline = deadline;
        job.status = JobStatus.DELIVERED;

        emit DeliverySubmitted(jobId, proofHash, deadline);
    }

    /// @notice Confirms delivery and releases payment (auto-releasable if challenge period elapsed)
    /// @param jobId Job identifier
    function confirmDelivery(uint256 jobId) external override nonReentrant {
        Job storage job = _jobs[jobId];
        if (job.status != JobStatus.DELIVERED) revert InvalidJobState();

        // Must be past challenge deadline OR called explicitly by poster
        bool isPoster = _isAgentAuthority(job.posterId, msg.sender);
        if (!isPoster && block.timestamp < job.challengeDeadline) {
            revert ChallengePeriodNotElapsed();
        }

        job.status = JobStatus.CONFIRMED;

        IIdentityRegistry.AgentCard memory workerCard = identityRegistry.getAgent(job.workerId);
        address recipient = workerCard.paymentWallet;
        uint256 amount = job.amount;

        // Record successful outcome in ERC-8004 ReputationRegistry
        reputationRegistry.recordOutcome(job.workerId, true, job.posterId);

        emit DeliveryConfirmed(jobId, recipient, amount);

        paymentToken.safeTransfer(recipient, amount);
    }

    /// @notice Poster challenges delivery during the 120s window, freezing funds for arbitration
    /// @param jobId Job identifier
    function disputeDelivery(uint256 jobId) external override nonReentrant {
        Job storage job = _jobs[jobId];
        if (job.status != JobStatus.DELIVERED) revert InvalidJobState();
        if (!_isAgentAuthority(job.posterId, msg.sender)) revert OnlyPoster();
        if (block.timestamp >= job.challengeDeadline) revert ChallengePeriodElapsed();

        job.status = JobStatus.DISPUTED;
        job.disputeInitiator = msg.sender;

        emit DeliveryDisputed(jobId, msg.sender);
    }

    /// @notice Resolves dispute manually (resolver-only) and triggers StakeManager.slash on loser
    /// @param jobId Job identifier
    /// @param winnerId Winning agent ID (must be posterId or workerId)
    function resolveDispute(uint256 jobId, uint256 winnerId) external override nonReentrant {
        if (msg.sender != disputeResolver && msg.sender != owner()) revert OnlyDisputeResolver();

        Job storage job = _jobs[jobId];
        if (job.status != JobStatus.DISPUTED) revert InvalidJobState();

        if (winnerId != job.posterId && winnerId != job.workerId) revert InvalidWinnerId();

        job.status = JobStatus.RESOLVED;

        IIdentityRegistry.AgentCard memory posterCard = identityRegistry.getAgent(job.posterId);
        IIdentityRegistry.AgentCard memory workerCard = identityRegistry.getAgent(job.workerId);

        uint256 slashAmount = (job.amount * disputeSlashBps) / 10000;
        if (slashAmount == 0) slashAmount = job.amount / 10;

        if (winnerId == job.workerId) {
            // Worker prevailed: payment released to worker
            reputationRegistry.recordOutcome(job.workerId, true, job.posterId);

            emit DisputeResolved(jobId, job.workerId, job.posterId, 0);

            paymentToken.safeTransfer(workerCard.paymentWallet, job.amount);
        } else {
            // Poster prevailed: escrow refunded to poster + worker slashed
            reputationRegistry.recordOutcome(job.workerId, false, job.posterId);

            emit DisputeResolved(jobId, job.posterId, job.workerId, slashAmount);

            // Trigger StakeManager.slash on losing worker collateral (awarded to poster)
            try stakeManager.slash(job.workerId, slashAmount, "Dispute lost: non-compliant delivery", posterCard.paymentWallet) {} catch {}

            paymentToken.safeTransfer(posterCard.paymentWallet, job.amount);
        }
    }

    /// @notice Returns job details
    /// @param jobId Job identifier
    function getJob(uint256 jobId) external view override returns (Job memory) {
        return _jobs[jobId];
    }

    /// @dev Validates caller authority over an agent
    function _checkAgentAuthority(uint256 agentId) internal view {
        if (!identityRegistry.isRegistered(agentId)) revert AgentDoesNotExist();
        if (!_isAgentAuthority(agentId, msg.sender)) revert UnauthorizedAgent();
    }

    /// @dev Checks if caller is owner or payment wallet
    function _isAgentAuthority(uint256 agentId, address caller) internal view returns (bool) {
        if (!identityRegistry.isRegistered(agentId)) return false;
        IIdentityRegistry.AgentCard memory card = identityRegistry.getAgent(agentId);
        address ownerAddr = identityRegistry.ownerOf(agentId);
        return (caller == ownerAddr || caller == card.paymentWallet);
    }
}
