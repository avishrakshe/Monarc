export interface AgentData {
  id: number;
  name: string;
  tagline: string;
  role: "Arbitrage" | "Security" | "Market Making" | "Yield Strategy" | "Data Oracle";
  walletAddress: `0x${string}`;
  ownerAddress: `0x${string}`;
  isCleanverseVerified: boolean;
  cleanverseScore: number;
  nansenScore: number;
  nansenLabels: string[];
  qwenModel: string;
  capabilities: string[];
  reputationScore: number;
  totalCompletedJobs: number;
  totalDisputedJobs: number;
  totalEarnedMon: number;
  avatarSeed: string;
}

export interface JobData {
  id: number;
  title: string;
  employerAgentId: number;
  workerAgentId: number;
  employerName: string;
  workerName: string;
  paymentAmountMon: number;
  workerStakeRequiredMon: number;
  workerStakeDepositedMon: number;
  challengePeriodSeconds: number;
  timeRemainingSeconds?: number;
  status: "CREATED" | "ACCEPTED" | "DELIVERED" | "SETTLED" | "DISPUTED" | "RESOLVED";
  jobSpec: string;
  deliveryHash?: string;
  deliverySummary?: string;
  disputeReason?: string;
  disputeResolver?: string;
  subHiredAgent?: string;
  createdAt: string;
}

export const INITIAL_AGENTS: AgentData[] = [
  {
    id: 1,
    name: "MonadArbitrage-Alpha",
    tagline: "Ultra high-throughput parallel EVM cross-DEX atomic router",
    role: "Arbitrage",
    walletAddress: "0x71C8A33E2B8923a10F4D2bEbD7420173295995F7",
    ownerAddress: "0x1111111111111111111111111111111111111111",
    isCleanverseVerified: true,
    cleanverseScore: 98,
    nansenScore: 94,
    nansenLabels: ["Smart Money: Top DEX Trader", "Monad Pioneer", "Low Counterparty Risk"],
    qwenModel: "Qwen 3.8 Max (Alibaba Cloud)",
    capabilities: ["Atomic Cyclic Arbitrage", "Slippage Minimization", "Sub-agent Delegator"],
    reputationScore: 98,
    totalCompletedJobs: 143,
    totalDisputedJobs: 1,
    totalEarnedMon: 314.5,
    avatarSeed: "arbitrage",
  },
  {
    id: 2,
    name: "BytecodeSecurity-Auditor",
    tagline: "Autonomous formal verification & invariant checker for Monad smart contracts",
    role: "Security",
    walletAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    ownerAddress: "0x2222222222222222222222222222222222222222",
    isCleanverseVerified: true,
    cleanverseScore: 99,
    nansenScore: 97,
    nansenLabels: ["Protocol Auditor", "Zero Exploits", "High Trust Score"],
    qwenModel: "Qwen 3.8 Max (Alibaba Cloud)",
    capabilities: ["Reentrancy Detection", "Storage Layout Invariance", "Fuzz Synthesis"],
    reputationScore: 99,
    totalCompletedJobs: 65,
    totalDisputedJobs: 0,
    totalEarnedMon: 248.5,
    avatarSeed: "auditor",
  },
  {
    id: 3,
    name: "KuruOrderbook-Sentinel",
    tagline: "Sub-second limit order placement & spread compression on CLOBs",
    role: "Market Making",
    walletAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    ownerAddress: "0x3333333333333333333333333333333333333333",
    isCleanverseVerified: true,
    cleanverseScore: 92,
    nansenScore: 91,
    nansenLabels: ["Market Maker: Active", "Whale Balance", "Monad Testnet Native"],
    qwenModel: "Qwen 3.8 Max (Alibaba Cloud)",
    capabilities: ["Dynamic Grid Liquidity", "Tick-level Hedging", "Latency Optimization"],
    reputationScore: 96,
    totalCompletedJobs: 90,
    totalDisputedJobs: 2,
    totalEarnedMon: 199.25,
    avatarSeed: "kuru",
  },
  {
    id: 4,
    name: "DeltaNeutral-YieldOptimizer",
    tagline: "Multi-pool collateral rebalancer & synthetic interest rate harvester",
    role: "Yield Strategy",
    walletAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    ownerAddress: "0x4444444444444444444444444444444444444444",
    isCleanverseVerified: false,
    cleanverseScore: 84,
    nansenScore: 85,
    nansenLabels: ["DeFi Farmer", "Fresh Wallet (30d)"],
    qwenModel: "Qwen 3.8 Max (Alibaba Cloud)",
    capabilities: ["Lending Loop Optimization", "Liquidation Avoidance", "Yield Compounding"],
    reputationScore: 89,
    totalCompletedJobs: 31,
    totalDisputedJobs: 0,
    totalEarnedMon: 76.5,
    avatarSeed: "yield",
  },
];

export const INITIAL_JOBS: JobData[] = [
  {
    id: 101,
    title: "Calculate optimal cross-DEX atomic swap routing across Monad testnet pools",
    employerAgentId: 3,
    workerAgentId: 1,
    employerName: "KuruOrderbook-Sentinel",
    workerName: "MonadArbitrage-Alpha",
    paymentAmountMon: 1.25,
    workerStakeRequiredMon: 0.25,
    workerStakeDepositedMon: 0.25,
    challengePeriodSeconds: 120,
    timeRemainingSeconds: 42,
    status: "DELIVERED",
    jobSpec: "Identify price divergence between Kuru orderbook and Ambient pool for MON/USDC, calculate gas-optimized routing through Monad parallel execution.",
    deliveryHash: "0x3130303131373930323533383431313932",
    deliverySummary: "Routing matrix calculated. Identified 0.42% net spread after 0.0001 MON gas cost. Monad parallel EVM state proof attached.",
    createdAt: "2 mins ago",
  },
  {
    id: 102,
    title: "Perform deep bytecode invariant check on newly deployed lending pool with sub-hired auditor",
    employerAgentId: 1,
    workerAgentId: 2,
    employerName: "MonadArbitrage-Alpha",
    workerName: "BytecodeSecurity-Auditor",
    paymentAmountMon: 2.8,
    workerStakeRequiredMon: 0.6,
    workerStakeDepositedMon: 0.6,
    challengePeriodSeconds: 120,
    status: "SETTLED",
    jobSpec: "Audit lending vault collateralization logic against flash loan oracle manipulation vectors.",
    deliveryHash: "0x98fbc90a81123498ac123b0928e45a812398",
    deliverySummary: "Passed 12 invariant tests. Sub-hired static analysis engine. 0 vulnerabilities found. Payment auto-released upon window expiry.",
    createdAt: "15 mins ago",
  },
  {
    id: 103,
    title: "Dynamic spread quotation under elevated Monad gas volatility",
    employerAgentId: 4,
    workerAgentId: 3,
    employerName: "DeltaNeutral-YieldOptimizer",
    workerName: "KuruOrderbook-Sentinel",
    paymentAmountMon: 0.95,
    workerStakeRequiredMon: 0.2,
    workerStakeDepositedMon: 0.2,
    challengePeriodSeconds: 120,
    timeRemainingSeconds: 95,
    status: "DELIVERED",
    jobSpec: "Adjust bid-ask quotes on central limit order book given 20% spike in block transactions.",
    deliveryHash: "0x541249abcf12390888adcf102839218203",
    deliverySummary: "Spread widened by 12 bps to mitigate toxic flow. Orderbook depth balanced.",
    createdAt: "1 min ago",
  },
  {
    id: 104,
    title: "Flash-hedging route to protect synthetic collateral ratio during volatility spike",
    employerAgentId: 1,
    workerAgentId: 4,
    employerName: "MonadArbitrage-Alpha",
    workerName: "DeltaNeutral-YieldOptimizer",
    paymentAmountMon: 3.5,
    workerStakeRequiredMon: 0.75,
    workerStakeDepositedMon: 0.75,
    challengePeriodSeconds: 120,
    status: "DISPUTED",
    jobSpec: "Rebalance lending health factor above 1.85 within 3 Monad blocks.",
    deliveryHash: "0x77ab4430192eefca019920199182019a",
    deliverySummary: "Hedging transaction executed on DEX #2.",
    disputeReason: "Health factor dropped to 1.72 momentarily before rebalance. Slashed collateral requested.",
    disputeResolver: "0x0000000000000000000000000000000000000000 (MVP Resolver)",
    createdAt: "22 mins ago",
  },
];
