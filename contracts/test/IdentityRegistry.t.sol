// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/IdentityRegistry.sol";

contract IdentityRegistryTest is Test {
    IdentityRegistry public identity;

    address public owner = address(this);
    address public agent1 = address(0x101);
    address public agent2 = address(0x102);

    bytes public validProof = hex"12345678";
    bytes public invalidProof = hex"";

    event AgentRegistered(uint256 indexed agentId, address indexed owner, uint256 verifiedAt);

    function setUp() public {
        identity = new IdentityRegistry(address(0), owner);
    }

    function test_RegisterWithCleanverseProof() public {
        vm.expectEmit(true, true, false, false);
        emit AgentRegistered(1, address(this), block.timestamp);

        uint256 agentId = identity.register(
            agent1,
            "AlphaRouter",
            "https://alpha.monarc.xyz",
            validProof
        );

        assertEq(agentId, 1);
        assertEq(identity.ownerOf(agentId), address(this));
        assertEq(identity.getAgentIdByWallet(agent1), agentId);

        IIdentityRegistry.AgentCard memory card = identity.getAgent(agentId);
        assertEq(card.name, "AlphaRouter");
        assertEq(card.apiEndpoint, "https://alpha.monarc.xyz");
        assertEq(card.paymentWallet, agent1);
        assertEq(card.registeredAt, block.timestamp);
    }

    function test_RegisterShortOverload() public {
        uint256 agentId = identity.register(agent1, validProof);
        assertEq(agentId, 1);
        IIdentityRegistry.AgentCard memory card = identity.getAgent(agentId);
        assertEq(card.paymentWallet, agent1);
    }

    function test_RevertInvalidCleanverseProof() public {
        vm.expectRevert(IdentityRegistry.InvalidCleanverseProof.selector);
        identity.register(agent1, invalidProof);
    }

    function test_RevertDuplicateWalletRegistration() public {
        identity.register(agent1, validProof);

        vm.expectRevert(IdentityRegistry.AgentAlreadyRegistered.selector);
        identity.register(agent1, validProof);
    }

    function test_RevertNonExistentAgent() public {
        vm.expectRevert(IdentityRegistry.AgentDoesNotExist.selector);
        identity.getAgent(999);
    }
}
