// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/MockUSDC.sol";
import "../src/IdentityRegistry.sol";
import "../src/StakeManager.sol";

contract StakeManagerTest is Test {
    MockUSDC public usdc;
    IdentityRegistry public identity;
    StakeManager public stakeManager;

    address public resolver = address(0x999);
    address public agentWallet = address(0x101);
    uint256 public agentId;

    function setUp() public {
        usdc = new MockUSDC();
        identity = new IdentityRegistry(address(0), address(this));
        stakeManager = new StakeManager(address(usdc), address(identity), resolver);

        agentId = identity.register(agentWallet, hex"deadbeef");

        usdc.mint(address(this), 10_000 * 10 ** 6);
        usdc.approve(address(stakeManager), type(uint256).max);
    }

    function test_StakeCollateral() public {
        uint256 amount = 1_000 * 10 ** 6;
        stakeManager.stake(agentId, amount);

        (uint256 active, uint256 unbonding, ) = stakeManager.getStake(agentId);
        assertEq(active, amount);
        assertEq(unbonding, 0);
        assertEq(usdc.balanceOf(address(stakeManager)), amount);
    }

    function test_WithdrawWithUnbondingPeriod() public {
        uint256 amount = 1_000 * 10 ** 6;
        stakeManager.stake(agentId, amount);

        // Cannot withdraw without requesting unbonding first
        vm.expectRevert(StakeManager.InsufficientUnbondingAmount.selector);
        stakeManager.withdraw(agentId, amount);

        // Request unbonding
        stakeManager.requestWithdraw(agentId, amount);

        (uint256 active, uint256 unbonding, uint256 releaseTime) = stakeManager.getStake(agentId);
        assertEq(active, 0);
        assertEq(unbonding, amount);
        assertEq(releaseTime, block.timestamp + 120);

        // Before release time -> reverts
        vm.warp(block.timestamp + 60);
        vm.expectRevert(StakeManager.UnbondingPeriodNotElapsed.selector);
        stakeManager.withdraw(agentId, amount);

        // After release time -> succeeds and sends to agentWallet
        vm.warp(block.timestamp + 61);
        uint256 walletBalBefore = usdc.balanceOf(agentWallet);
        stakeManager.withdraw(agentId, amount);

        assertEq(usdc.balanceOf(agentWallet), walletBalBefore + amount);
    }

    function test_SlashResolverOnly() public {
        uint256 amount = 1_000 * 10 ** 6;
        stakeManager.stake(agentId, amount);

        address recipient = address(0x888);
        uint256 slashAmount = 300 * 10 ** 6;

        // Unauthorized caller reverts
        vm.prank(address(0x123));
        vm.expectRevert(StakeManager.UnauthorizedResolver.selector);
        stakeManager.slash(agentId, slashAmount, "Fraud", recipient);

        // Resolver slashes
        vm.prank(resolver);
        stakeManager.slash(agentId, slashAmount, "Fraud detected", recipient);

        (uint256 active, , ) = stakeManager.getStake(agentId);
        assertEq(active, amount - slashAmount);
        assertEq(usdc.balanceOf(recipient), slashAmount);
    }
}
