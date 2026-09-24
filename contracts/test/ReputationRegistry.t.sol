// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/IdentityRegistry.sol";
import "../src/ReputationRegistry.sol";

contract ReputationRegistryTest is Test {
    IdentityRegistry public identity;
    ReputationRegistry public reputation;

    address public reporter = address(0x501);
    address public client = address(0x601);
    address public agentOwner = address(0x101);
    address public agentWallet = address(0x201);
    uint256 public agentId;

    function setUp() public {
        identity = new IdentityRegistry();
        reputation = new ReputationRegistry(address(identity));

        reputation.setAuthorizedReporter(reporter, true);

        vm.prank(agentOwner);
        agentId = identity.registerAgent("ipfs://QmAgentCard", agentWallet);
    }

    function test_GiveFeedbackAndComputeAverage() public {
        vm.prank(client);
        reputation.giveFeedback(agentId, 90, "defi-audit", "Flawless arbitrage execution", keccak256("job1"));

        vm.prank(client);
        reputation.giveFeedback(agentId, 80, "arbitrage", "Good speed and gas efficiency", keccak256("job2"));

        IERC8004Reputation.AgentReputationSummary memory summary = reputation.getSummary(agentId);
        assertEq(summary.feedbackCount, 2);
        assertEq(summary.averageScore, 85);
        assertEq(reputation.getFeedbackCount(agentId), 2);

        IERC8004Reputation.Feedback memory f0 = reputation.getFeedback(agentId, 0);
        assertEq(f0.reviewer, client);
        assertEq(f0.score, 90);
    }

    function test_RecordJobCompletionByAuthorizedReporter() public {
        vm.prank(reporter);
        reputation.recordJobCompletion(agentId, 5 ether, true);

        IERC8004Reputation.AgentReputationSummary memory summary = reputation.getSummary(agentId);
        assertEq(summary.totalCompletedJobs, 1);
        assertEq(summary.totalEarned, 5 ether);
        assertEq(summary.totalDisputedJobs, 0);

        // Record disputed failure
        vm.prank(reporter);
        reputation.recordJobCompletion(agentId, 0, false);

        summary = reputation.getSummary(agentId);
        assertEq(summary.totalCompletedJobs, 1);
        assertEq(summary.totalDisputedJobs, 1);
    }

    function test_RevertIfUnauthorizedReporter() public {
        vm.prank(address(0x999));
        vm.expectRevert(ReputationRegistry.UnauthorizedCaller.selector);
        reputation.recordJobCompletion(agentId, 1 ether, true);
    }
}
