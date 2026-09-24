// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/MockUSDC.sol";
import "../src/IdentityRegistry.sol";
import "../src/ReputationRegistry.sol";
import "../src/StakeManager.sol";
import "../src/PaymentSettlement.sol";

/// @title DeployScript
/// @notice Foundry deployment script for Monarc on Monad Testnet (Chain ID: 10143)
/// @dev Follows Monad's official Foundry deploy guide
contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envOr(
            "PRIVATE_KEY",
            uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80)
        );
        address deployer = vm.addr(deployerPrivateKey);

        address resolver = vm.envOr("DISPUTE_RESOLVER_ADDRESS", deployer);
        address nansenWriter = vm.envOr("NANSEN_WRITER_ADDRESS", deployer);

        console2.log("==========================================");
        console2.log("Deploying Monarc to Monad Testnet (10143)");
        console2.log("Deployer Address:", deployer);
        console2.log("Dispute Resolver:", resolver);
        console2.log("Nansen Writer:", nansenWriter);
        console2.log("==========================================");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Stablecoin (MockUSDC for testnet)
        MockUSDC usdc = new MockUSDC();
        console2.log("MockUSDC deployed at:", address(usdc));

        // 2. Deploy IdentityRegistry (ERC-8004)
        IdentityRegistry identity = new IdentityRegistry(address(0), deployer);
        console2.log("IdentityRegistry deployed at:", address(identity));

        // 3. Deploy ReputationRegistry (ERC-8004)
        ReputationRegistry reputation = new ReputationRegistry(address(identity), nansenWriter);
        console2.log("ReputationRegistry deployed at:", address(reputation));

        // 4. Deploy StakeManager
        StakeManager stakeManager = new StakeManager(address(usdc), address(identity), resolver);
        console2.log("StakeManager deployed at:", address(stakeManager));

        // 5. Deploy PaymentSettlement (x402)
        PaymentSettlement settlement = new PaymentSettlement(
            address(usdc),
            address(identity),
            address(reputation),
            address(stakeManager),
            resolver
        );
        console2.log("PaymentSettlement deployed at:", address(settlement));

        // 6. Connect permissions
        reputation.setPaymentSettlement(address(settlement));
        stakeManager.setPaymentSettlement(address(settlement));
        console2.log("Permissions configured: Settlement authorized on Reputation and StakeManager.");

        vm.stopBroadcast();

        console2.log("==========================================");
        console2.log("Monarc Contracts Successfully Deployed!");
        console2.log("==========================================");
    }
}
