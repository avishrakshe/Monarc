// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/IdentityRegistry.sol";
import "../src/ValidationRegistry.sol";

contract ValidationRegistryTest is Test {
    IdentityRegistry public identity;
    ValidationRegistry public validation;

    address public validator = address(0x401);
    address public agentOwner = address(0x101);
    address public agentWallet = address(0x201);
    uint256 public agentId;

    function setUp() public {
        identity = new IdentityRegistry();
        validation = new ValidationRegistry(address(identity));
        validation.setValidator(validator, true);

        vm.prank(agentOwner);
        agentId = identity.registerAgent("ipfs://QmAgentCard", agentWallet);
    }

    function test_AttestValidation() public {
        bytes32 deliveryHash = keccak256("Delivery Proof");

        vm.prank(validator);
        validation.attestValidation(agentId, deliveryHash, true, "ipfs://QmReport");

        IERC8004Validation.ValidationAttestation memory att = validation.getValidation(deliveryHash);
        assertEq(att.validator, validator);
        assertEq(att.agentId, agentId);
        assertEq(att.passed, true);
        assertEq(att.reportURI, "ipfs://QmReport");
    }

    function test_RevertIfUnauthorizedValidator() public {
        bytes32 deliveryHash = keccak256("Delivery Proof 2");

        vm.prank(address(0x999));
        vm.expectRevert(ValidationRegistry.UnauthorizedValidator.selector);
        validation.attestValidation(agentId, deliveryHash, true, "ipfs://QmReport");
    }
}
