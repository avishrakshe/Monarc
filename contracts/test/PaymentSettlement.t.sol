// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/IdentityRegistry.sol";
import "../src/ReputationRegistry.sol";
import "../src/PaymentSettlement.sol";

contract PaymentSettlementTest is Test {
    IdentityRegistry public identity;
    ReputationRegistry public reputation;
    PaymentSettlement public settlement;

    address public resolver = address(0x999);
    address public employerOwner = address(0x111);
    address public employerWallet = address(0x222);
    address public workerOwner = address(0x333);
    address public workerWallet = address(0x444);

    uint256 public employerAgentId;
    uint256 public workerAgentId;

    function setUp() public {
        identity = new IdentityRegistry();
        reputation = new ReputationRegistry(address(identity));
        settlement = new PaymentSettlement(address(identity), address(reputation), resolver);

        reputation.setAuthorizedReporter(address(settlement), true);

        // Register employer agent
        vm.prank(employerOwner);
        employerAgentId = identity.registerAgent("ipfs://QmEmployer", employerWallet);

        // Register worker agent
        vm.prank(workerOwner);
        workerAgentId = identity.registerAgent("ipfs://QmWorker", workerWallet);

        vm.deal(employerWallet, 50 ether);
        vm.deal(workerWallet, 50 ether);
        vm.deal(employerOwner, 50 ether);
        vm.deal(workerOwner, 50 ether);
    }

    function test_FullHappyPathSettlement() public {
        uint256 payment = 2 ether;
        uint256 workerStake = 0.5 ether;
        bytes32 specHash = keccak256("DeFi Liquidity Rebalancing Task");

        // 1. Employer creates job
        vm.prank(employerWallet);
        uint256 jobId = settlement.createJob{value: payment}(
            employerAgentId,
            workerAgentId,
            workerStake,
            120, // 120s challenge period
            specHash
        );

        IPaymentSettlement.Job memory job = settlement.getJob(jobId);
        assertEq(uint8(job.status), uint8(IPaymentSettlement.JobStatus.CREATED));
        assertEq(job.paymentAmount, payment);

        // 2. Worker accepts job with stake
        vm.prank(workerWallet);
        settlement.acceptJob{value: workerStake}(jobId);

        job = settlement.getJob(jobId);
        assertEq(uint8(job.status), uint8(IPaymentSettlement.JobStatus.ACCEPTED));
        assertEq(job.workerStakeDeposited, workerStake);

        // 3. Worker submits delivery
        bytes32 delivHash = keccak256("Delivery Payload v1");
        vm.prank(workerWallet);
        settlement.submitDelivery(jobId, delivHash, "ipfs://QmDeliveryResult");

        job = settlement.getJob(jobId);
        assertEq(uint8(job.status), uint8(IPaymentSettlement.JobStatus.DELIVERED));
        assertEq(job.challengeDeadline, block.timestamp + 120);

        // Cannot claim before challenge deadline
        vm.expectRevert(PaymentSettlement.ChallengePeriodNotElapsed.selector);
        settlement.claimPayment(jobId);

        // 4. Warp past challenge period (undisputed auto-release)
        vm.warp(block.timestamp + 121);

        uint256 workerBalanceBefore = workerWallet.balance;
        settlement.claimPayment(jobId);

        job = settlement.getJob(jobId);
        assertEq(uint8(job.status), uint8(IPaymentSettlement.JobStatus.SETTLED));
        assertEq(workerWallet.balance, workerBalanceBefore + payment + workerStake);

        // Verify reputation record
        IERC8004Reputation.AgentReputationSummary memory summary = reputation.getSummary(workerAgentId);
        assertEq(summary.totalCompletedJobs, 1);
        assertEq(summary.totalEarned, payment);
    }

    function test_DisputeResolvedInFavorOfEmployer_SlashesWorker() public {
        uint256 payment = 3 ether;
        uint256 workerStake = 1 ether;

        vm.prank(employerWallet);
        uint256 jobId = settlement.createJob{value: payment}(
            employerAgentId,
            workerAgentId,
            workerStake,
            120,
            keccak256("MEV Searcher Job")
        );

        vm.prank(workerWallet);
        settlement.acceptJob{value: workerStake}(jobId);

        vm.prank(workerWallet);
        settlement.submitDelivery(jobId, keccak256("Bad delivery"), "ipfs://QmFaulty");

        // Employer raises dispute within 120s window
        vm.prank(employerWallet);
        settlement.raiseDispute(jobId, "Delivery output failed verification criteria");

        IPaymentSettlement.Job memory job = settlement.getJob(jobId);
        assertEq(uint8(job.status), uint8(IPaymentSettlement.JobStatus.DISPUTED));

        // Resolver decides in favor of employer (slashes worker collateral)
        uint256 employerBalanceBefore = employerWallet.balance;
        vm.prank(resolver);
        settlement.resolveDispute(jobId, false, "Audit confirmed delivery was incomplete");

        job = settlement.getJob(jobId);
        assertEq(uint8(job.status), uint8(IPaymentSettlement.JobStatus.RESOLVED));

        // Employer received back payment + slashed worker stake
        assertEq(employerWallet.balance, employerBalanceBefore + payment + workerStake);

        // Worker reputation reflects disputed job
        IERC8004Reputation.AgentReputationSummary memory summary = reputation.getSummary(workerAgentId);
        assertEq(summary.totalDisputedJobs, 1);
        assertEq(summary.totalCompletedJobs, 0);
    }

    function test_DisputeResolvedInFavorOfWorker() public {
        uint256 payment = 2 ether;
        uint256 workerStake = 0.5 ether;

        vm.prank(employerWallet);
        uint256 jobId = settlement.createJob{value: payment}(
            employerAgentId,
            workerAgentId,
            workerStake,
            120,
            keccak256("Sub-agent Task")
        );

        vm.prank(workerWallet);
        settlement.acceptJob{value: workerStake}(jobId);

        vm.prank(workerWallet);
        settlement.submitDelivery(jobId, keccak256("Good delivery"), "ipfs://QmSuccess");

        // Frivolous dispute by employer
        vm.prank(employerWallet);
        settlement.raiseDispute(jobId, "Frivolous complaint");

        // Resolver decides favorWorker = true
        uint256 workerBalanceBefore = workerWallet.balance;
        vm.prank(resolver);
        settlement.resolveDispute(jobId, true, "Work verified correct against spec");

        assertEq(workerWallet.balance, workerBalanceBefore + payment + workerStake);

        IERC8004Reputation.AgentReputationSummary memory summary = reputation.getSummary(workerAgentId);
        assertEq(summary.totalCompletedJobs, 1);
    }
}
