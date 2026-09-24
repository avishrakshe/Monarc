// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/MockUSDC.sol";
import "../src/IdentityRegistry.sol";
import "../src/ReputationRegistry.sol";
import "../src/StakeManager.sol";
import "../src/PaymentSettlement.sol";

contract PaymentSettlementTest is Test {
    MockUSDC public usdc;
    IdentityRegistry public identity;
    ReputationRegistry public reputation;
    StakeManager public stakeManager;
    PaymentSettlement public settlement;

    address public resolver = address(0x999);
    address public posterWallet = address(0x101);
    address public workerWallet = address(0x202);

    uint256 public posterId;
    uint256 public workerId;

    function setUp() public {
        usdc = new MockUSDC();
        identity = new IdentityRegistry(address(0), address(this));
        reputation = new ReputationRegistry(address(identity), address(this));
        stakeManager = new StakeManager(address(usdc), address(identity), resolver);

        settlement = new PaymentSettlement(
            address(usdc),
            address(identity),
            address(reputation),
            address(stakeManager),
            resolver
        );

        reputation.setPaymentSettlement(address(settlement));
        stakeManager.setPaymentSettlement(address(settlement));

        posterId = identity.register(posterWallet, hex"11112222");
        workerId = identity.register(workerWallet, hex"33334444");

        // Fund poster and worker
        usdc.mint(address(this), 10_000 * 10 ** 6);
        usdc.mint(posterWallet, 10_000 * 10 ** 6);
        usdc.mint(workerWallet, 10_000 * 10 ** 6);

        vm.prank(posterWallet);
        usdc.approve(address(settlement), type(uint256).max);

        vm.prank(workerWallet);
        usdc.approve(address(stakeManager), type(uint256).max);

        // Worker stakes collateral in StakeManager
        vm.prank(workerWallet);
        stakeManager.stake(workerId, 500 * 10 ** 6);
    }

    function test_FullHappyPathSettlement() public {
        uint256 paymentAmount = 100 * 10 ** 6; // 100 USDC
        bytes32 spec = keccak256("DeFi Arbitrage Optimization Job");

        // 1. Poster creates job
        vm.prank(posterWallet);
        uint256 jobId = settlement.createJob(posterId, paymentAmount, spec);

        IPaymentSettlement.Job memory job = settlement.getJob(jobId);
        assertEq(job.jobId, 1);
        assertEq(job.amount, paymentAmount);
        assertEq(uint8(job.status), uint8(IPaymentSettlement.JobStatus.CREATED));

        // 2. Worker accepts job
        vm.prank(workerWallet);
        settlement.acceptJob(jobId, workerId);

        job = settlement.getJob(jobId);
        assertEq(uint8(job.status), uint8(IPaymentSettlement.JobStatus.ACCEPTED));
        assertEq(job.workerId, workerId);

        // 3. Worker delivers work
        bytes32 proof = keccak256("Proof payload v1");
        vm.prank(workerWallet);
        settlement.submitDelivery(jobId, proof);

        job = settlement.getJob(jobId);
        assertEq(uint8(job.status), uint8(IPaymentSettlement.JobStatus.DELIVERED));
        assertEq(job.challengeDeadline, block.timestamp + 120);

        // Reverts if third party claims before challenge window elapses
        vm.prank(address(0x888));
        vm.expectRevert(PaymentSettlement.ChallengePeriodNotElapsed.selector);
        settlement.confirmDelivery(jobId);

        // 4. Warp past 120s optimistic window -> auto-release
        vm.warp(block.timestamp + 121);

        uint256 workerBalanceBefore = usdc.balanceOf(workerWallet);
        settlement.confirmDelivery(jobId);

        job = settlement.getJob(jobId);
        assertEq(uint8(job.status), uint8(IPaymentSettlement.JobStatus.CONFIRMED));
        assertEq(usdc.balanceOf(workerWallet), workerBalanceBefore + paymentAmount);

        // Verify reputation record outcome
        int256 rep = reputation.getReputation(workerId);
        assertEq(rep, 150); // 100 base + 50 success
    }

    function test_DisputeAndResolverSlashesWorker() public {
        uint256 paymentAmount = 200 * 10 ** 6;
        bytes32 spec = keccak256("Security Audit Job");

        vm.prank(posterWallet);
        uint256 jobId = settlement.createJob(posterId, paymentAmount, spec);

        vm.prank(workerWallet);
        settlement.acceptJob(jobId, workerId);

        vm.prank(workerWallet);
        settlement.submitDelivery(jobId, keccak256("Incomplete delivery"));

        // Poster disputes within 120s window
        vm.prank(posterWallet);
        settlement.disputeDelivery(jobId);

        IPaymentSettlement.Job memory job = settlement.getJob(jobId);
        assertEq(uint8(job.status), uint8(IPaymentSettlement.JobStatus.DISPUTED));

        // Resolver decides in favor of poster -> worker collateral slashed, poster refunded
        uint256 posterBalBefore = usdc.balanceOf(posterWallet);
        (uint256 workerStakeBefore, , ) = stakeManager.getStake(workerId);

        vm.prank(resolver);
        settlement.resolveDispute(jobId, posterId);

        job = settlement.getJob(jobId);
        assertEq(uint8(job.status), uint8(IPaymentSettlement.JobStatus.RESOLVED));

        // Poster received refund + slashed collateral (20% of 200 USDC = 40 USDC)
        uint256 slashExpected = 40 * 10 ** 6;
        assertEq(usdc.balanceOf(posterWallet), posterBalBefore + paymentAmount + slashExpected);

        (uint256 workerStakeAfter, , ) = stakeManager.getStake(workerId);
        assertEq(workerStakeAfter, workerStakeBefore - slashExpected);

        // Reputation penalized
        int256 rep = reputation.getReputation(workerId);
        assertEq(rep, -50); // 100 base - 150 failed
    }

    function test_DisputeResolvedInFavorOfWorker() public {
        uint256 paymentAmount = 150 * 10 ** 6;
        bytes32 spec = keccak256("AMM Rebalancing");

        vm.prank(posterWallet);
        uint256 jobId = settlement.createJob(posterId, paymentAmount, spec);

        vm.prank(workerWallet);
        settlement.acceptJob(jobId, workerId);

        vm.prank(workerWallet);
        settlement.submitDelivery(jobId, keccak256("Valid delivery"));

        vm.prank(posterWallet);
        settlement.disputeDelivery(jobId);

        // Resolver rules favor of worker
        uint256 workerBalBefore = usdc.balanceOf(workerWallet);

        vm.prank(resolver);
        settlement.resolveDispute(jobId, workerId);

        assertEq(usdc.balanceOf(workerWallet), workerBalBefore + paymentAmount);

        int256 rep = reputation.getReputation(workerId);
        assertEq(rep, 150);
    }
}
