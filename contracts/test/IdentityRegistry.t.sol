// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/IdentityRegistry.sol";

contract IdentityRegistryTest is Test {
    IdentityRegistry public identity;

    address public owner = address(this);
    address public agent1Owner = address(0x101);
    address public agent1Wallet = address(0x201);
    address public agent2Owner = address(0x102);
    address public agent2Wallet = address(0x202);
    address public verifier = address(0x301);

    function setUp() public {
        identity = new IdentityRegistry();
        identity.setAuthorizedVerifier(verifier, true);
    }

    function test_RegisterAgent() public {
        vm.prank(agent1Owner);
        uint256 agentId = identity.registerAgent("ipfs://QmAgent1Card", agent1Wallet);

        assertEq(agentId, 1);
        assertEq(identity.ownerOf(agentId), agent1Owner);
        assertEq(identity.getAgentIdByWallet(agent1Wallet), agentId);

        IERC8004Identity.Agent memory a = identity.getAgent(agentId);
        assertEq(a.owner, agent1Owner);
        assertEq(a.walletAddress, agent1Wallet);
        assertEq(a.agentCardURI, "ipfs://QmAgent1Card");
        assertFalse(a.isCleanverseVerified);
        assertTrue(identity.isRegistered(agentId));
    }

    function test_RevertIfRegisterDuplicateWallet() public {
        vm.prank(agent1Owner);
        identity.registerAgent("ipfs://QmAgent1Card", agent1Wallet);

        vm.prank(agent2Owner);
        vm.expectRevert(IdentityRegistry.AgentAlreadyRegistered.selector);
        identity.registerAgent("ipfs://QmAgent2Card", agent1Wallet);
    }

    function test_CleanverseVerification() public {
        vm.prank(agent1Owner);
        uint256 agentId = identity.registerAgent("ipfs://QmAgent1Card", agent1Wallet);

        // Non-verifier cannot attest
        vm.prank(address(0x999));
        vm.expectRevert(IdentityRegistry.UnauthorizedVerifier.selector);
        identity.setCleanverseVerified(agentId, true);

        // Verifier attests
        vm.prank(verifier);
        identity.setCleanverseVerified(agentId, true);

        IERC8004Identity.Agent memory a = identity.getAgent(agentId);
        assertTrue(a.isCleanverseVerified);
    }

    function test_UpdateAgentCardURI() public {
        vm.prank(agent1Owner);
        uint256 agentId = identity.registerAgent("ipfs://QmAgent1Card", agent1Wallet);

        vm.prank(agent1Owner);
        identity.setAgentCardURI(agentId, "ipfs://QmAgent1Updated");

        IERC8004Identity.Agent memory a = identity.getAgent(agentId);
        assertEq(a.agentCardURI, "ipfs://QmAgent1Updated");
        assertEq(identity.tokenURI(agentId), "ipfs://QmAgent1Updated");
    }
}
