// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IStakeManager.sol";
import "./interfaces/IIdentityRegistry.sol";

/// @title StakeManager
/// @notice Manages agent collateral staking, unbonding, and dispute slashing on Monad
contract StakeManager is Ownable, ReentrancyGuard, IStakeManager {
    using SafeERC20 for IERC20;

    /// @dev Custom errors
    error InvalidIdentityRegistry();
    error InvalidStakingToken();
    error InvalidResolverAddress();
    error UnauthorizedResolver();
    error UnauthorizedAgent();
    error InsufficientStake();
    error InsufficientUnbondingAmount();
    error UnbondingPeriodNotElapsed();
    error InvalidAmount();
    error AgentDoesNotExist();

    IERC20 public immutable stakingToken;
    IIdentityRegistry public immutable identityRegistry;

    /// @notice Authorized dispute resolver address
    address public disputeResolver;

    /// @notice Authorized PaymentSettlement contract allowed to trigger slashing
    address public paymentSettlement;

    /// @notice Duration required for unbonding before funds can be withdrawn
    uint256 public unbondingPeriod = 120 seconds;

    struct StakeRecord {
        uint256 activeStake;
        uint256 unbondingAmount;
        uint256 releaseTime;
    }

    mapping(uint256 => StakeRecord) private _stakes;

    constructor(
        address _stakingToken,
        address _identityRegistry,
        address _disputeResolver
    ) Ownable(msg.sender) {
        if (_stakingToken == address(0)) revert InvalidStakingToken();
        if (_identityRegistry == address(0)) revert InvalidIdentityRegistry();
        if (_disputeResolver == address(0)) revert InvalidResolverAddress();

        stakingToken = IERC20(_stakingToken);
        identityRegistry = IIdentityRegistry(_identityRegistry);
        disputeResolver = _disputeResolver;
    }

    /// @notice Updates authorized dispute resolver address
    /// @param _resolver New resolver address
    function setDisputeResolver(address _resolver) external onlyOwner {
        if (_resolver == address(0)) revert InvalidResolverAddress();
        disputeResolver = _resolver;
    }

    /// @notice Sets authorized PaymentSettlement contract
    /// @param _settlement PaymentSettlement contract address
    function setPaymentSettlement(address _settlement) external onlyOwner {
        paymentSettlement = _settlement;
    }

    /// @notice Updates unbonding period in seconds
    /// @param _period Duration in seconds
    function setUnbondingPeriod(uint256 _period) external onlyOwner {
        unbondingPeriod = _period;
    }

    /// @notice Stakes collateral for an agent
    /// @param agentId Unique agent identifier
    /// @param amount Amount of stakingToken to deposit
    function stake(uint256 agentId, uint256 amount) external override nonReentrant {
        if (!identityRegistry.isRegistered(agentId)) revert AgentDoesNotExist();
        if (amount == 0) revert InvalidAmount();

        _stakes[agentId].activeStake += amount;

        emit Staked(agentId, msg.sender, amount);

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
    }

    /// @notice Slashes an agent's stake upon losing a dispute
    /// @dev Callable ONLY by disputeResolver or paymentSettlement
    /// @param agentId Target agent ID
    /// @param amount Amount to slash
    /// @param reason Explanation of why agent was slashed
    function slash(uint256 agentId, uint256 amount, string calldata reason) external override {
        slash(agentId, amount, reason, msg.sender);
    }

    /// @notice Slashes an agent's stake and forwards slashed funds to a recipient
    /// @dev Callable ONLY by disputeResolver or paymentSettlement
    /// @param agentId Target agent ID
    /// @param amount Amount to slash
    /// @param reason Explanation of why agent was slashed
    /// @param recipient Address receiving the slashed collateral
    function slash(
        uint256 agentId,
        uint256 amount,
        string calldata reason,
        address recipient
    ) public override nonReentrant {
        if (msg.sender != disputeResolver && msg.sender != paymentSettlement && msg.sender != owner()) {
            revert UnauthorizedResolver();
        }
        if (amount == 0) revert InvalidAmount();

        StakeRecord storage record = _stakes[agentId];
        uint256 available = record.activeStake + record.unbondingAmount;
        if (available < amount) revert InsufficientStake();

        if (record.activeStake >= amount) {
            record.activeStake -= amount;
        } else {
            uint256 remaining = amount - record.activeStake;
            record.activeStake = 0;
            record.unbondingAmount -= remaining;
        }

        emit Slashed(agentId, amount, reason, recipient);

        stakingToken.safeTransfer(recipient, amount);
    }

    /// @notice Requests unbonding for withdrawal with a timelock period
    /// @param agentId Unique agent identifier
    /// @param amount Amount to unbond
    function requestWithdraw(uint256 agentId, uint256 amount) public nonReentrant {
        _checkAgentAuthority(agentId);
        if (amount == 0) revert InvalidAmount();

        StakeRecord storage record = _stakes[agentId];
        if (record.activeStake < amount) revert InsufficientStake();

        record.activeStake -= amount;
        record.unbondingAmount += amount;
        record.releaseTime = block.timestamp + unbondingPeriod;

        emit UnbondingRequested(agentId, amount, record.releaseTime);
    }

    /// @notice Withdraws unbonded collateral after unbonding period has elapsed
    /// @param agentId Unique agent identifier
    /// @param amount Amount to withdraw
    function withdraw(uint256 agentId, uint256 amount) external override nonReentrant {
        _checkAgentAuthority(agentId);
        if (amount == 0) revert InvalidAmount();

        StakeRecord storage record = _stakes[agentId];

        // If unbonding period is 0, allow direct withdrawal from active stake
        if (unbondingPeriod == 0) {
            if (record.activeStake < amount) revert InsufficientStake();
            record.activeStake -= amount;
        } else {
            // Must have unbonded funds
            if (record.unbondingAmount < amount) revert InsufficientUnbondingAmount();
            if (block.timestamp < record.releaseTime) revert UnbondingPeriodNotElapsed();
            record.unbondingAmount -= amount;
        }

        IIdentityRegistry.AgentCard memory card = identityRegistry.getAgent(agentId);
        address recipient = card.paymentWallet;

        emit Withdrawn(agentId, recipient, amount);

        stakingToken.safeTransfer(recipient, amount);
    }

    /// @notice Returns stake details for an agent
    /// @param agentId Unique agent identifier
    function getStake(uint256 agentId)
        external
        view
        override
        returns (uint256 activeStake, uint256 unbondingAmount, uint256 releaseTime)
    {
        StakeRecord memory r = _stakes[agentId];
        return (r.activeStake, r.unbondingAmount, r.releaseTime);
    }

    /// @dev Validates that caller is owner or payment wallet of agentId
    function _checkAgentAuthority(uint256 agentId) internal view {
        if (!identityRegistry.isRegistered(agentId)) revert AgentDoesNotExist();
        IIdentityRegistry.AgentCard memory card = identityRegistry.getAgent(agentId);
        address ownerAddr = identityRegistry.ownerOf(agentId);
        if (msg.sender != ownerAddr && msg.sender != card.paymentWallet) {
            revert UnauthorizedAgent();
        }
    }
}
