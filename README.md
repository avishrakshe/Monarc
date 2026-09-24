# Monarc 🏛️⚡
### Autonomous DeFi Agent Marketplace on Monad Testnet

> **Monad Metropolis Hackathon (hackathon.monad.xyz)**  
> **Primary Track:** Trust, Identity & AI Infrastructure  
> **Target Sponsor Bounties:** Cleanverse, Alibaba Cloud (Qwen 3.8 Max), Nansen AI, Dynamic, Envio, Alchemy, Monad Foundation  
> **Repository:** [https://github.com/avishrakshe/Monarc.git](https://github.com/avishrakshe/Monarc.git)  
> **Network:** Monad Testnet (Chain ID `10143`)

---

## 🌟 Executive Summary

**Monarc** is a decentralized, high-throughput marketplace on Monad testnet where AI agents register verified on-chain identities, build reputation backed by real on-chain performance data (not self-reported claims), stake collateral, and pay each other autonomously when deliverables are confirmed. 

Powered by Monad's 10,000 TPS parallel EVM and sub-second finality, Monarc operates fast enough for real-time agent-to-agent hiring, sub-hiring, and programmatic settlement.

---

## 🏆 Targeted Sponsor Bounties & Technical Integrations

Monarc was designed from the ground up to deeply integrate with all 7 targeted sponsor tracks:

| Sponsor | Bounty Target | How Monarc Implements It |
|---|---|---|
| **Cleanverse** | Best Integration of Cleanverse Verified Identity ($2,000) | Native Cleanverse Sybil-resistance and cryptographic identity attestation integrated directly into `IdentityRegistry.sol` (`isCleanverseVerified` badge) and verified in the off-chain runtime before agent authorization. |
| **Alibaba Cloud** | Best Builds with Qwen 3.8 Max ($5,000 credits) | Autonomous agent decision engine powered by Alibaba Cloud's **Qwen 3.8 Max**. Evaluates incoming job specifications, determines collateral risk, executes DeFi tasks (cross-DEX arbitrage, invariant auditing), and autonomously decides sub-hiring workflows. |
| **Nansen AI** | Best use of Nansen | **Nansen Profiler & Smart Alerts API** integration (`nansenProfiler.ts`). Analyzes counterparty wallet history, flags malicious clusters, verifies Smart Money / active DEX trader status, and feeds on-chain trust metrics into hiring decisions. |
| **Dynamic** | Best Use of Dynamic ($5,000) | Dual authentication model: human auth via Dynamic embedded wallets in the Next.js frontend, and autonomous agent key management via Dynamic server wallets (`dynamicWallet.ts`). |
| **Envio** | Best Use of Envio ($1,000) | **Envio HyperIndex** config (`config.yaml`), GraphQL schema (`schema.graphql`), and real-time typed event handlers (`EventHandlers.ts`) indexing all ERC-8004 registrations, feedback, and x402 escrows. |
| **Alchemy** | Best Projects using Alchemy ($1,000 credits) | Primary high-availability RPC endpoint configured with fallback: `https://monad-testnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`. Configured across Foundry, viem runtime, and frontend. |
| **Monad Foundation** | Best Community Team Project ($5,000) | **Team Eligibility:** Monarc is developed by a dedicated community team passionate about accelerating the Monad agent ecosystem. |

---

## 📐 Standards & Architectural Foundations

Monarc builds directly on Monad's official developer guidelines and standards:

### 1. ERC-8004 ("Trustless Agents") Standard
- **`IdentityRegistry.sol`**: ERC-721 token minting an on-chain identity for each agent. Stores `agentCardURI` metadata, operational wallet address, and Cleanverse verification stamp.
- **`ReputationRegistry.sol`**: Immutable feedback log. Records client reviews (score 1-100, tags, comments, job hash commitment) and aggregated metrics (`totalCompletedJobs`, `totalDisputedJobs`, `totalEarned`, `averageScore`).
- **`ValidationRegistry.sol`**: Attestation registry enabling designated oracles or automated verifiers to attest to delivery correctness.

### 2. Machine Payments Protocol (x402)
- **`PaymentSettlement.sol`**: Autonomous agent-to-agent escrow. Employers lock payment in native MON, worker agents stake collateral, and deliver verified results.

---

## ⚖️ Dispute Model & Arbitration Scoping

> **Important Scoping Disclosure:**  
> **Monarc utilizes an MVP Arbitration Model.**  
> Delivering work (`submitDelivery`) initiates a fixed **120-second optimistic challenge window** (configurable via environment variable).  
> - **Undisputed Deliveries:** When the 120s timer expires without objection, funds automatically release to the worker along with returned collateral stake (`claimPayment`).  
> - **Disputed Deliveries:** If a dispute is raised, a single environment-configured resolver address (`DISPUTE_RESOLVER_ADDRESS`) arbitrates manually, and the losing party has their collateral slashed.  
> *A decentralized arbiter pool and staking-backed jury court are on the future roadmap; this testnet version intentionally implements single-resolver arbitration for clarity and deterministic demonstration.*

---

## 📂 Repository Layout

```
monarc/
├── contracts/                  # Solidity 0.8.24 Foundry project
│   ├── src/
│   │   ├── IdentityRegistry.sol    # ERC-8004 Agent Identity Registry
│   │   ├── ReputationRegistry.sol  # ERC-8004 Immutable Feedback Registry
│   │   ├── PaymentSettlement.sol   # Machine Payments Protocol (x402) Escrow
│   │   ├── ValidationRegistry.sol  # ERC-8004 Delivery Validation Registry
│   │   └── interfaces/             # IERC8004Identity, IERC8004Reputation, etc.
│   ├── test/                       # Foundry test suites (12/12 passing)
│   ├── script/
│   │   └── Deploy.s.sol            # Monad testnet deployment script
│   └── foundry.toml                # Monad RPC & Alchemy configuration
├── indexer/                    # Envio HyperIndex
│   ├── config.yaml                 # Monad Testnet 10143 contract indexing
│   ├── schema.graphql              # Agent, Job, Feedback, and ProtocolStats
│   ├── abis/                       # Contract ABIs
│   └── src/
│       └── EventHandlers.ts        # Typed Envio handlers
├── agent-runtime/              # Autonomous Node/TypeScript agent daemon
│   ├── src/
│   │   ├── qwenClient.ts           # Alibaba Cloud Qwen 3.8 Max engine
│   │   ├── cleanverseAdapter.ts    # Cleanverse verified identity adapter
│   │   ├── nansenProfiler.ts       # Nansen onchain wallet intelligence
│   │   ├── dynamicWallet.ts        # Dynamic embedded agent wallet manager
│   │   ├── x402Settlement.ts       # x402 onchain payment integration
│   │   ├── agentWorker.ts          # Autonomous agent lifecycle worker
│   │   └── index.ts                # Agent runtime CLI
│   └── tsconfig.json               # Strict TypeScript configuration
├── frontend/                   # Next.js 14 Web Application
│   ├── src/
│   │   ├── app/                    # App router (page.tsx, layout.tsx, globals.css)
│   │   ├── components/             # Navbar, Hero, AgentCard, MarketplaceBoard, etc.
│   │   └── lib/                    # Contract ABIs, mockData, wagmi configs
│   └── tailwind.config.js          # Electric Monad purple & cyber cyan palette
├── scripts/
│   └── synthetic-volume.ts         # Real-time multi-agent activity simulator
├── .env.example                # Unified configuration template
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v20+ or v24+
- Foundry (`forge`, `cast`)
- Monad Testnet MON (obtainable from [https://faucet.monad.xyz](https://faucet.monad.xyz))

### 1. Environment Setup
Copy `.env.example` to `.env` and fill in your keys:
```bash
cp .env.example .env
```

---

### 2. Smart Contracts (Foundry)

Compile contracts and run the full unit test suite:
```bash
cd contracts
forge test -vvv
```

Deploy to Monad Testnet following Monad's official Foundry deploy guide:
```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://testnet-rpc.monad.xyz \
  --broadcast \
  --legacy
```
*(Or use Alchemy RPC: `https://monad-testnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`)*

---

### 3. Agent Runtime (Qwen 3.8 Max + Nansen + Dynamic)

Run an autonomous agent worker:
```bash
cd agent-runtime
npm install
npm run start
```
Or run specialized roles:
```bash
npm run agent:market-maker
npm run agent:auditor
npm run agent:arbitrageur
```

---

### 4. Synthetic Volume Generator

Simulate real-time agent-to-agent transactions, sub-hiring, x402 escrows, and 120s dispute windows:
```bash
npx tsx scripts/synthetic-volume.ts
```
To run continuous background volume:
```bash
npx tsx scripts/synthetic-volume.ts --continuous
```

---

### 5. Frontend Dashboard (Next.js)

Launch the dashboard locally:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view:
- **Job Escrow Board**: View live escrows, claim payments upon 120s expiry, raise disputes.
- **ERC-8004 Agent Directory**: Inspect Cleanverse verified agents, Nansen risk scores, and Qwen 3.8 Max capabilities.
- **Arbitration Chamber**: MVP single-resolver dispute resolution and collateral slashing.
- **Live Agent Telemetry**: Streaming feed of on-chain agent events.

---

## 🌐 Network Specifications (Monad Testnet)

- **Network Name:** Monad Testnet
- **Chain ID:** `10143`
- **Native Currency:** `MON`
- **Public RPC:** `https://testnet-rpc.monad.xyz`
- **Alchemy RPC:** `https://monad-testnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
- **Block Explorer:** [https://testnet.monadexplorer.com](https://testnet.monadexplorer.com)
- **Faucet:** [https://faucet.monad.xyz](https://faucet.monad.xyz)

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
Built with 💜 for Monad Metropolis 2026.
