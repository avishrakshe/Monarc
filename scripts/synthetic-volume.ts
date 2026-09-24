/**
 * Synthetic Volume & Real-Time Agent Marketplace Activity Generator for Monarc
 * Simulates high-speed agent-to-agent hiring, sub-hiring, x402 payment escrow,
 * optimistic dispute windows, and ERC-8004 reputation updates on Monad.
 */

import path from "node:path";
import fs from "node:fs";

// Resilient env loading using Node 20+ native loadEnvFile
try {
  const rootEnv = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(rootEnv) && typeof process.loadEnvFile === "function") {
    process.loadEnvFile(rootEnv);
  }
} catch {
  // Silent fallback
}

interface SimulatedAgent {
  id: number;
  name: string;
  role: string;
  wallet: string;
  isCleanverseVerified: boolean;
  nansenScore: number;
  reputation: number;
  completedJobs: number;
  totalVolumeMon: number;
}

interface SimulatedJob {
  id: number;
  employerId: number;
  workerId: number;
  title: string;
  paymentMon: number;
  stakeMon: number;
  status: "CREATED" | "ACCEPTED" | "DELIVERED" | "SETTLED" | "DISPUTED" | "RESOLVED";
  subHired: boolean;
  timestamp: string;
}

const AGENTS: SimulatedAgent[] = [
  {
    id: 1,
    name: "MonadArbitrage-Alpha",
    role: "Cross-DEX Arbitrage & Liquidity Router",
    wallet: "0x71C8A33E2B8923a10F4D2bEbD7420173295995F7",
    isCleanverseVerified: true,
    nansenScore: 94,
    reputation: 98,
    completedJobs: 142,
    totalVolumeMon: 312.5,
  },
  {
    id: 2,
    name: "KuruOrderbook-Sentinel",
    role: "High-Frequency Limit Order Quoter",
    wallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    isCleanverseVerified: true,
    nansenScore: 91,
    reputation: 96,
    completedJobs: 89,
    totalVolumeMon: 198.0,
  },
  {
    id: 3,
    name: "BytecodeSecurity-Auditor",
    role: "Autonomous Smart Contract Invariant Verifier",
    wallet: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    isCleanverseVerified: true,
    nansenScore: 97,
    reputation: 99,
    completedJobs: 64,
    totalVolumeMon: 245.0,
  },
  {
    id: 4,
    name: "DeltaNeutral-YieldOptimizer",
    role: "Automated Lending & Collateral Rebalancer",
    wallet: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    isCleanverseVerified: false,
    nansenScore: 82,
    reputation: 88,
    completedJobs: 31,
    totalVolumeMon: 76.5,
  },
];

const JOB_TEMPLATES = [
  {
    title: "Calculate optimal cross-DEX atomic swap routing across Monad testnet pools",
    paymentMon: 1.25,
    stakeMon: 0.25,
    needsSubHire: false,
  },
  {
    title: "Perform deep bytecode invariant check on newly deployed lending pool with sub-hired auditor",
    paymentMon: 2.8,
    stakeMon: 0.6,
    needsSubHire: true,
  },
  {
    title: "Rebalance concentrated liquidity ticks on ambient DEX to minimize divergence loss",
    paymentMon: 0.95,
    stakeMon: 0.2,
    needsSubHire: false,
  },
  {
    title: "Execute flash-hedging route to protect synthetic collateral ratio during volatility spike",
    paymentMon: 3.5,
    stakeMon: 0.75,
    needsSubHire: false,
  },
  {
    title: "Verify zero-slippage execution proof and attest delivery in ValidationRegistry",
    paymentMon: 1.5,
    stakeMon: 0.3,
    needsSubHire: true,
  },
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runSyntheticVolumeCycle(iteration: number) {
  console.log(`\n================================================================================`);
  console.log(`[SYNTHETIC VOLUME SIMULATOR] Cycle #${iteration} @ ${new Date().toISOString()}`);
  console.log(`Monad Testnet (Chain ID: 10143) | Machine Payments Protocol (x402) | ERC-8004`);
  console.log(`================================================================================`);

  // Pick random employer and worker
  const employerIndex = Math.floor(Math.random() * AGENTS.length);
  let workerIndex = Math.floor(Math.random() * AGENTS.length);
  while (workerIndex === employerIndex) {
    workerIndex = Math.floor(Math.random() * AGENTS.length);
  }

  const employer = AGENTS[employerIndex]!;
  const worker = AGENTS[workerIndex]!;
  const template = JOB_TEMPLATES[Math.floor(Math.random() * JOB_TEMPLATES.length)]!;

  console.log(`\n1. [ERC-8004 Identity & Trust Verification]`);
  console.log(`   Employer: ${employer.name} (ID: ${employer.id})`);
  console.log(`   Worker:   ${worker.name} (ID: ${worker.id})`);
  console.log(`   Cleanverse Verified Badge: Employer=${employer.isCleanverseVerified} | Worker=${worker.isCleanverseVerified}`);
  console.log(`   Nansen Onchain Score:      Employer=${employer.nansenScore}/100 | Worker=${worker.nansenScore}/100`);

  // Step 2: Escrow Creation
  const jobId = 1000 + iteration;
  console.log(`\n2. [x402 Payment Escrow Created]`);
  console.log(`   Job #${jobId}: "${template.title}"`);
  console.log(`   Locked MON Escrow: ${template.paymentMon} MON`);
  console.log(`   Worker Collateral Required: ${template.stakeMon} MON`);
  console.log(`   Optimistic Challenge Window: 120s`);

  await sleep(600);

  // Step 3: Acceptance & Stake
  console.log(`\n3. [Worker Agent Accepts & Stakes Collateral]`);
  console.log(`   ${worker.name} deposited ${template.stakeMon} MON stake collateral`);
  console.log(`   Status: CREATED -> ACCEPTED`);

  await sleep(600);

  // Step 4: Qwen 3.8 Max Reasoning & Sub-Hiring
  console.log(`\n4. [Alibaba Cloud Qwen 3.8 Max Decision Engine]`);
  console.log(`   Synthesizing DeFi execution plan...`);
  if (template.needsSubHire) {
    const subHiredAgent = AGENTS[(workerIndex + 1) % AGENTS.length]!;
    const subBudget = (template.paymentMon * 0.3).toFixed(3);
    console.log(`   >>> SUB-HIRING TRIGGERED by Qwen 3.8 Max!`);
    console.log(`   >>> Hired Sub-Agent: ${subHiredAgent.name} (ID: ${subHiredAgent.id})`);
    console.log(`   >>> Sub-task Escrow: ${subBudget} MON allocated for independent validation`);
  } else {
    console.log(`   >>> Task executed directly by worker agent via parallel EVM routes.`);
  }

  await sleep(600);

  // Step 5: Delivery & Optimistic Challenge
  console.log(`\n5. [submitDelivery & Challenge Window Triggered]`);
  const deliveryHash = `0x${Buffer.from(jobId.toString() + Date.now().toString()).toString("hex").padEnd(64, "0").slice(0, 64)}`;
  console.log(`   Delivery Hash: ${deliveryHash}`);
  console.log(`   Status: ACCEPTED -> DELIVERED`);
  console.log(`   Challenge countdown active (120s). Monitoring for disputes...`);

  await sleep(600);

  // Simulate dispute in 1 out of 8 cycles
  const isDisputed = iteration % 8 === 0;

  if (isDisputed) {
    console.log(`\n6. [DISPUTE RAISED & ARBITRATION TRIGGERED]`);
    console.log(`   Employer ${employer.name} raised dispute: "Invariant check deviation detected"`);
    console.log(`   Status: DELIVERED -> DISPUTED`);
    console.log(`   Calling single MVP dispute resolver...`);
    await sleep(500);
    console.log(`   Dispute resolved in favor of Employer!`);
    console.log(`   Worker collateral ${template.stakeMon} MON SLASHED and awarded to Employer.`);
    console.log(`   Worker reputation penalized in ERC-8004 ReputationRegistry.`);
  } else {
    console.log(`\n6. [Auto-Release Settlement & Reputation Accrual]`);
    console.log(`   Challenge period elapsed with 0 disputes.`);
    console.log(`   Status: DELIVERED -> SETTLED`);
    console.log(`   Released: ${template.paymentMon} MON payment + ${template.stakeMon} MON returned stake -> ${worker.name}`);

    // Update stats
    worker.completedJobs += 1;
    worker.totalVolumeMon += template.paymentMon;

    const feedbackScore = 95 + Math.floor(Math.random() * 6);
    console.log(`\n7. [ERC-8004 Reputation Feedback Recorded]`);
    console.log(`   Client gave feedback: Score ${feedbackScore}/100 ("Superb execution speed and gas economy")`);
    console.log(`   Worker updated total completed jobs: ${worker.completedJobs} | Volume: ${worker.totalVolumeMon.toFixed(2)} MON`);
  }

  console.log(`\n[Cycle #${iteration} Finished Successfully]`);
}

async function main() {
  const isContinuous = process.argv.includes("--continuous");
  const maxCycles = isContinuous ? 100 : 3;

  console.log(`Starting Monarc Synthetic Volume Generator (Total Cycles: ${maxCycles})...\n`);

  for (let i = 1; i <= maxCycles; i++) {
    await runSyntheticVolumeCycle(i);
    if (i < maxCycles) {
      console.log(`\nWaiting 3 seconds before next transaction bundle...\n`);
      await sleep(3000);
    }
  }

  console.log("\n================================================================================");
  console.log(" Synthetic volume run complete! All agent-to-agent transactions confirmed.");
  console.log("================================================================================");
}

main().catch(console.error);
