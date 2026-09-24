// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/IdentityRegistry.sol";
import "../src/ReputationRegistry.sol";

contract ReputationRegistryTest is Test {
    IdentityRegistry public identity;
    ReputationRegistry public reputation;

    address public nansenWriter = address(0x201);
    address public settlement = address(0x301);
    address public agent1Wallet = address(0x101);
    uint256 public agentId;

    function setUp() public {
        identity = new IdentityRegistry(address(0), address(this));
        reputation = new ReputationRegistry(address(identity), nansenWriter);
        reputation.setPaymentSettlement(settlement);

        agentId = identity.register(agent1Wallet, hex"deadbeef");
    }

    function test_RecordOutcomeOnlyBySettlement() public {
        vm.prank(settlement);
        reputation.recordOutcome(agentId, true, 2);

        int256 rep = reputation.getReputation(agentId);
        // Base 100 + 50 = 150
        assertEq(rep, 150);

        // Record failure
        vm.prank(settlement);
        reputation.recordOutcome(agentId, false, 3);
        // 150 - 150 = 0
        rep = reputation.getReputation(agentId);
        assertEq(rep, 0);
    }

    function test_RevertRecordOutcomeUnauthorized() public {
        vm.prank(address(0x999));
        vm.expectRevert(ReputationRegistry.UnauthorizedPaymentSettlement.selector);
        reputation.recordOutcome(agentId, true, 2);
    }

    function test_UpdateExternalSignalNansen() public {
        vm.prank(nansenWriter);
        reputation.updateExternalSignal(agentId, 85, block.timestamp);

        // Base 100 + (85 * 5) = 100 + 425 = 525
        int256 rep = reputation.getReputation(agentId);
        assertEq(rep, 525);
    }

    function test_RevertUpdateExternalSignalUnauthorized() public {
        vm.prank(address(0x999));
        vm.expectRevert(ReputationRegistry.UnauthorizedSignalWriter.selector);
        reputation.updateExternalSignal(agentId, 90, block.timestamp);
    }
}
