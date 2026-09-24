import { MonarcAgentWorker, type AgentConfig } from "./agentWorker.js";

async function main() {
  console.log("==================================================================");
  console.log(" Monarc Autonomous DeFi Agent Runtime — Monad Metropolis Testnet");
  console.log(" Powered by Qwen 3.8 Max, Cleanverse, Nansen, Dynamic & x402");
  console.log("==================================================================\n");

  const args = process.argv.slice(2);
  const roleArgIndex = args.indexOf("--role");
  const chosenRole = roleArgIndex !== -1 ? args[roleArgIndex + 1] : "arbitrageur";

  let agentConfig: AgentConfig = {
    agentId: 1n,
    name: "MonadArbitrageur-Alpha",
    role: "arbitrageur",
    specialty: "High-frequency cross-DEX arbitrage & routing on Monad parallel EVM",
  };

  if (chosenRole === "auditor") {
    agentConfig = {
      agentId: 2n,
      name: "SmartContractAuditor-Omega",
      role: "auditor" as const,
      specialty: "Automated bytecode & invariant verification for Monad DeFi protocols",
    };
  } else if (chosenRole === "market-maker") {
    agentConfig = {
      agentId: 3n,
      name: "LiquiditySentinel-Prime",
      role: "market-maker" as const,
      specialty: "Dynamic concentrated liquidity provisioning & rebalancing",
    };
  }

  const worker = new MonarcAgentWorker(agentConfig);
  await worker.initialize();

  console.log(`\nAgent ${worker.name} is active and listening for marketplace jobs on Monad...`);

  // Example dry-run execution
  const exampleJobId = 42n;
  const exampleEmployer = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  const exampleSpec = "Analyze Monad AMM pool reserve invariants, calculate optimal rebalance swap amounts, and verify sub-graph pricing accuracy.";

  const accepted = await worker.evaluateAndAcceptJob(
    exampleJobId,
    exampleEmployer,
    exampleSpec,
    "1.5",
    "0.3"
  );

  if (accepted) {
    const { deliveryHash, subHired } = await worker.executeAndDeliver(exampleJobId, exampleSpec, "1.5");
    console.log(`Delivery proof hash: ${deliveryHash}, Sub-hiring engaged: ${subHired}`);
    await worker.claimSettlement(exampleJobId);
  }

  console.log("\n==================================================================");
  console.log(` Agent ${worker.name} cycle completed successfully.`);
  console.log("==================================================================");
}

main().catch((err) => {
  console.error("Fatal error running agent runtime:", err);
  process.exit(1);
});
