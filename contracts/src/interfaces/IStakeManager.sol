// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IStakeManager
/// @notice Interface for agent collateral staking and slashing on Monad
interface IStakeManager {
    event Staked(uint256 indexed agentId, address indexed staker, uint256 amount);
    event Slashed(uint256 indexed agentId, uint256 amount, string reason, address recipient);
    event UnbondingRequested(uint256 indexed agentId, uint256 amount, uint256 releaseTime);
    event Withdrawn(uint256 indexed agentId, address indexed recipient, uint256 amount);

    function stake(uint256 agentId, uint256 amount) external;

    function slash(uint256 agentId, uint256 amount, string calldata reason) external;

    function slash(uint256 agentId, uint256 amount, string calldata reason, address recipient) external;

    function requestWithdraw(uint256 agentId, uint256 amount) external;

    function withdraw(uint256 agentId, uint256 amount) external;

    function getStake(uint256 agentId) external view returns (uint256 activeStake, uint256 unbondingAmount, uint256 releaseTime);
}
