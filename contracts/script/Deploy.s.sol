// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/IdentityRegistry.sol";
import "../src/ReputationRegistry.sol";
import "../src/PaymentSettlement.sol";
import "../src/ValidationRegistry.sol";

/// @title DeployScript
/// @notice Foundry deployment script for Monarc on Monad Testnet (Chain ID: 10143)
/// @dev Following Monad's official Foundry deploy guidelines
contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envOr(
            "PRIVATE_KEY",
            uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80)
        );
        address deployer = vm.addr(deployerPrivateKey);

        address resolver = vm.envOr("DISPUTE_RESOLVER_ADDRESS", deployer);

        console2.log("==========================================");
        console2.log("Deploying Monarc to Monad Testnet");
        console2.log("Deployer Address:", deployer);
        console2.log("Dispute Resolver Address:", resolver);
        console2.log("==========================================");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy IdentityRegistry (ERC-8004)
        IdentityRegistry identityRegistry = new IdentityRegistry();
        console2.log("IdentityRegistry deployed at:", address(identityRegistry));

        // 2. Deploy ReputationRegistry (ERC-8004)
        ReputationRegistry reputationRegistry = new ReputationRegistry(address(identityRegistry));
        console2.log("ReputationRegistry deployed at:", address(reputationRegistry));

        // 3. Deploy PaymentSettlement (x402)
        PaymentSettlement paymentSettlement = new PaymentSettlement(
            address(identityRegistry),
            address(reputationRegistry),
            resolver
        );
        console2.log("PaymentSettlement deployed at:", address(paymentSettlement));

        // 4. Deploy ValidationRegistry (ERC-8004)
        ValidationRegistry validationRegistry = new ValidationRegistry(address(identityRegistry));
        console2.log("ValidationRegistry deployed at:", address(validationRegistry));

        // 5. Authorize PaymentSettlement to report job completions to ReputationRegistry
        reputationRegistry.setAuthorizedReporter(address(paymentSettlement), true);
        console2.log("ReputationRegistry: Authorized PaymentSettlement as reporter");

        vm.stopBroadcast();

        console2.log("==========================================");
        console2.log("Monarc Contracts Successfully Deployed!");
        console2.log("==========================================");
    }
}
