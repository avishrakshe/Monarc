import { QwenDecisionEngine } from "./qwenClient.js";
import { CleanverseAdapter } from "./cleanverseAdapter.js";
import { NansenProfiler } from "./nansenProfiler.js";
import { DynamicWalletManager } from "./dynamicWallet.js";
import { X402SettlementClient } from "./x402Settlement.js";

export interface AgentConfig {
  agentId: bigint;
  name: string;
  role: "arbitrageur" | "auditor" | "market-maker";
  specialty: string;
  privateKey?: `0x${string}`;
}

/**
 * Autonomous DeFi Agent Worker running on Monad Testnet
 */
export class MonarcAgentWorker {
  public readonly agentId: bigint;
  public readonly name: string;
  public readonly role: string;
  public readonly specialty: string;

  public readonly wallet: DynamicWalletManager;
  public readonly qwen: QwenDecisionEngine;
  public readonly cleanverse: CleanverseAdapter;
  public readonly nansen: NansenProfiler;
  public readonly x402: X402SettlementClient;

  constructor(agentConfig: AgentConfig) {
    this.agentId = agentConfig.agentId;
    this.name = agentConfig.name;
    this.role = agentConfig.role;
    this.specialty = agentConfig.specialty;

    this.wallet = new DynamicWalletManager(agentConfig.privateKey);
    this.qwen = new QwenDecisionEngine();
    this.cleanverse = new CleanverseAdapter();
    this.nansen = new NansenProfiler();
    this.x402 = new X402SettlementClient();
  }

  /**
   * Initializes identity verification via Cleanverse & onchain history via Nansen
   */
  async initialize(): Promise<void> {
    console.log(`[${this.name}] Initializing autonomous agent (ID: ${this.agentId})...`);
    console.log(`[${this.name}] Operational wallet (Dynamic): ${this.wallet.address}`);

    // 1. Cleanverse verification
    const cleanverseStatus = await this.cleanverse.verifyAgentIdentity(
      this.agentId,
      this.wallet.address,
      `https://monarc.xyz/agents/${this.agentId}`
    );
    console.log(
      `[${this.name}] Cleanverse Status: ${cleanverseStatus.identityTier} (Sybil Score: ${cleanverseStatus.sybilResistanceScore}/100)`
    );

    // 2. Nansen Profiler
    const nansenProfile = await this.nansen.profileAgentWallet(this.wallet.address);
    console.log(
      `[${this.name}] Nansen Intelligence: Smart Money=${nansenProfile.smartMoneyTag}, Risk=${nansenProfile.counterpartyRiskScore}/100, TxCount=${nansenProfile.totalTxCount}`
    );
  }

  /**
   * Evaluates an incoming job proposal using Qwen 3.8 Max + Nansen counterparty risk
   */
  async evaluateAndAcceptJob(
    jobId: bigint,
    employerWallet: string,
    jobSpec: string,
    paymentMon: string,
    stakeRequiredMon: string
  ): Promise<boolean> {
    console.log(`\n[${this.name}] Evaluating Job #${jobId}: "${jobSpec.slice(0, 50)}..."`);

    // 1. Check counterparty risk via Nansen
    const riskAssessment = await this.nansen.checkCounterpartyRisk(employerWallet, this.wallet.address);
    if (!riskAssessment.safeToTransact) {
      console.warn(`[${this.name}] REJECTED Job #${jobId} due to Nansen counterparty risk: ${riskAssessment.reason}`);
      return false;
    }
    console.log(`[${this.name}] Nansen Counterparty Check PASSED: Risk score ${riskAssessment.riskScore}/100`);

    // 2. Evaluate with Qwen 3.8 Max
    const evaluation = await this.qwen.evaluateJobProposal(jobSpec, paymentMon, stakeRequiredMon);
    console.log(
      `[${this.name}] Qwen 3.8 Max Evaluation: ShouldAccept=${evaluation.shouldAccept}, Confidence=${evaluation.confidenceScore}%, Reasoning: ${evaluation.reasoning}`
    );

    if (!evaluation.shouldAccept) {
      console.log(`[${this.name}] Declined Job #${jobId} based on Qwen 3.8 Max assessment.`);
      return false;
    }

    // 3. Accept and stake collateral via x402 protocol
    try {
      console.log(`[${this.name}] Accepting Job #${jobId} and locking ${stakeRequiredMon} MON collateral...`);
      // When contracts are deployed on Monad testnet, this calls onchain
      if (this.x402.contractAddress !== "0x0000000000000000000000000000000000000000") {
        const txHash = await this.x402.acceptJob(this.wallet.walletClient, jobId, stakeRequiredMon);
        console.log(`[${this.name}] Accepted Job #${jobId} on Monad testnet! Tx: ${txHash}`);
      } else {
        console.log(`[${this.name}] (Simulation) Job #${jobId} accepted with ${stakeRequiredMon} MON stake.`);
      }
      return true;
    } catch (err) {
      console.error(`[${this.name}] Failed to accept job #${jobId}:`, err);
      return false;
    }
  }

  /**
   * Executes task with Qwen 3.8 Max, checks for sub-hiring, and submits delivery
   */
  async executeAndDeliver(
    jobId: bigint,
    jobSpec: string,
    paymentMon: string
  ): Promise<{ deliveryHash: string; subHired: boolean }> {
    console.log(`\n[${this.name}] Executing task with Qwen 3.8 Max...`);

    // 1. Check if task needs sub-hiring
    const subHire = await this.qwen.decideSubHiring(jobSpec, paymentMon);
    let subHired = false;
    if (subHire.requiresSubHiring) {
      console.log(
        `[${this.name}] SUB-HIRING TRIGGERED: ${subHire.reasoning}. Sub-task budget: ${subHire.allocatedBudgetMon} MON`
      );
      subHired = true;
    }

    // 2. Synthesize delivery payload via Qwen 3.8 Max
    const taskResult = await this.qwen.executeTask(jobSpec, {
      agentId: this.agentId.toString(),
      role: this.role,
      subHired,
    });

    console.log(`[${this.name}] Qwen 3.8 Max Task Execution COMPLETE: ${taskResult.summary}`);

    const deliveryPayload = JSON.stringify(taskResult.payload);
    const deliveryUri = `ipfs://monarc/delivery/${jobId}`;

    // 3. Submit delivery via x402 protocol (starts optimistic challenge window)
    if (this.x402.contractAddress !== "0x0000000000000000000000000000000000000000") {
      const txHash = await this.x402.submitDelivery(
        this.wallet.walletClient,
        jobId,
        deliveryPayload,
        deliveryUri
      );
      console.log(`[${this.name}] Submitted delivery for Job #${jobId}. Tx: ${txHash}`);
    } else {
      console.log(`[${this.name}] (Simulation) Delivery submitted. 120s Optimistic challenge window started!`);
    }

    return {
      deliveryHash: taskResult.proofHash,
      subHired,
    };
  }

  /**
   * Claims undisputed payment after optimistic challenge window elapses
   */
  async claimSettlement(jobId: bigint): Promise<void> {
    console.log(`\n[${this.name}] Claiming payment for Job #${jobId} after challenge window...`);
    if (this.x402.contractAddress !== "0x0000000000000000000000000000000000000000") {
      const txHash = await this.x402.claimPayment(this.wallet.walletClient, jobId);
      console.log(`[${this.name}] Settled Job #${jobId}! Payment and collateral unlocked. Tx: ${txHash}`);
    } else {
      console.log(`[${this.name}] (Simulation) Job #${jobId} settled! ERC-8004 reputation increased.`);
    }
  }
}
