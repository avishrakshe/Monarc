import {
  type PublicClient,
  type WalletClient,
  type Address,
  parseEther,
  keccak256,
  toHex,
  createPublicClient,
  http,
} from "viem";
import { monadTestnet } from "./network.js";
import { config } from "./config.js";

// Minimal ABIs for x402 and ERC-8004
export const paymentSettlementAbi = [
  {
    type: "function",
    name: "createJob",
    stateMutability: "payable",
    inputs: [
      { name: "employerAgentId", type: "uint256" },
      { name: "workerAgentId", type: "uint256" },
      { name: "workerStakeRequired", type: "uint256" },
      { name: "challengePeriodSeconds", type: "uint256" },
      { name: "jobSpecHash", type: "bytes32" },
    ],
    outputs: [{ name: "jobId", type: "uint256" }],
  },
  {
    type: "function",
    name: "acceptJob",
    stateMutability: "payable",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "submitDelivery",
    stateMutability: "nonpayable",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "deliveryHash", type: "bytes32" },
      { name: "deliveryURI", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "claimPayment",
    stateMutability: "nonpayable",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "raiseDispute",
    stateMutability: "nonpayable",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "reason", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "resolveDispute",
    stateMutability: "nonpayable",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "favorWorker", type: "bool" },
      { name: "resolutionNotes", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getJob",
    stateMutability: "view",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "jobId", type: "uint256" },
          { name: "employerAgentId", type: "uint256" },
          { name: "workerAgentId", type: "uint256" },
          { name: "employerWallet", type: "address" },
          { name: "workerWallet", type: "address" },
          { name: "paymentAmount", type: "uint256" },
          { name: "workerStakeRequired", type: "uint256" },
          { name: "workerStakeDeposited", type: "uint256" },
          { name: "challengePeriodSeconds", type: "uint256" },
          { name: "challengeDeadline", type: "uint256" },
          { name: "jobSpecHash", type: "bytes32" },
          { name: "deliveryHash", type: "bytes32" },
          { name: "deliveryURI", type: "string" },
          { name: "status", type: "uint8" },
          { name: "disputeInitiator", type: "address" },
        ],
      },
    ],
  },
] as const;

export interface OnChainJobDetails {
  jobId: bigint;
  employerAgentId: bigint;
  workerAgentId: bigint;
  employerWallet: Address;
  workerWallet: Address;
  paymentAmount: bigint;
  workerStakeRequired: bigint;
  workerStakeDeposited: bigint;
  challengePeriodSeconds: bigint;
  challengeDeadline: bigint;
  jobSpecHash: `0x${string}`;
  deliveryHash: `0x${string}`;
  deliveryURI: string;
  status: number;
  disputeInitiator: Address;
}

/**
 * Machine Payments Protocol (x402) Client
 */
export class X402SettlementClient {
  public readonly publicClient: PublicClient;
  public readonly contractAddress: Address;

  constructor(customRpcUrl?: string, customContractAddress?: Address) {
    this.publicClient = createPublicClient({
      chain: monadTestnet,
      transport: http(customRpcUrl || config.alchemyRpcUrl || config.monadRpcUrl),
    });
    this.contractAddress = customContractAddress || config.contracts.paymentSettlement;
  }

  async createJob(
    walletClient: WalletClient,
    employerAgentId: bigint,
    workerAgentId: bigint,
    paymentMon: string,
    workerStakeMon: string,
    challengeSeconds: number,
    specText: string
  ): Promise<`0x${string}`> {
    const specHash = keccak256(toHex(specText));
    const valueWei = parseEther(paymentMon);
    const stakeWei = parseEther(workerStakeMon);

    const account = walletClient.account;
    if (!account) throw new Error("WalletClient account missing");

    const hash = await walletClient.writeContract({
      address: this.contractAddress,
      abi: paymentSettlementAbi,
      functionName: "createJob",
      args: [employerAgentId, workerAgentId, stakeWei, BigInt(challengeSeconds), specHash],
      value: valueWei,
      account,
      chain: monadTestnet,
    });

    return hash;
  }

  async acceptJob(
    walletClient: WalletClient,
    jobId: bigint,
    stakeMon: string
  ): Promise<`0x${string}`> {
    const account = walletClient.account;
    if (!account) throw new Error("WalletClient account missing");

    return await walletClient.writeContract({
      address: this.contractAddress,
      abi: paymentSettlementAbi,
      functionName: "acceptJob",
      args: [jobId],
      value: parseEther(stakeMon),
      account,
      chain: monadTestnet,
    });
  }

  async submitDelivery(
    walletClient: WalletClient,
    jobId: bigint,
    deliveryContent: string,
    deliveryUri: string
  ): Promise<`0x${string}`> {
    const account = walletClient.account;
    if (!account) throw new Error("WalletClient account missing");

    const deliveryHash = keccak256(toHex(deliveryContent));

    return await walletClient.writeContract({
      address: this.contractAddress,
      abi: paymentSettlementAbi,
      functionName: "submitDelivery",
      args: [jobId, deliveryHash, deliveryUri],
      account,
      chain: monadTestnet,
    });
  }

  async claimPayment(walletClient: WalletClient, jobId: bigint): Promise<`0x${string}`> {
    const account = walletClient.account;
    if (!account) throw new Error("WalletClient account missing");

    return await walletClient.writeContract({
      address: this.contractAddress,
      abi: paymentSettlementAbi,
      functionName: "claimPayment",
      args: [jobId],
      account,
      chain: monadTestnet,
    });
  }

  async raiseDispute(
    walletClient: WalletClient,
    jobId: bigint,
    reason: string
  ): Promise<`0x${string}`> {
    const account = walletClient.account;
    if (!account) throw new Error("WalletClient account missing");

    return await walletClient.writeContract({
      address: this.contractAddress,
      abi: paymentSettlementAbi,
      functionName: "raiseDispute",
      args: [jobId, reason],
      account,
      chain: monadTestnet,
    });
  }

  async resolveDispute(
    walletClient: WalletClient,
    jobId: bigint,
    favorWorker: boolean,
    notes: string
  ): Promise<`0x${string}`> {
    const account = walletClient.account;
    if (!account) throw new Error("WalletClient account missing");

    return await walletClient.writeContract({
      address: this.contractAddress,
      abi: paymentSettlementAbi,
      functionName: "resolveDispute",
      args: [jobId, favorWorker, notes],
      account,
      chain: monadTestnet,
    });
  }

  async getJob(jobId: bigint): Promise<OnChainJobDetails> {
    const data = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: paymentSettlementAbi,
      functionName: "getJob",
      args: [jobId],
    });

    return {
      jobId: data.jobId,
      employerAgentId: data.employerAgentId,
      workerAgentId: data.workerAgentId,
      employerWallet: data.employerWallet,
      workerWallet: data.workerWallet,
      paymentAmount: data.paymentAmount,
      workerStakeRequired: data.workerStakeRequired,
      workerStakeDeposited: data.workerStakeDeposited,
      challengePeriodSeconds: data.challengePeriodSeconds,
      challengeDeadline: data.challengeDeadline,
      jobSpecHash: data.jobSpecHash,
      deliveryHash: data.deliveryHash,
      deliveryURI: data.deliveryURI,
      status: Number(data.status),
      disputeInitiator: data.disputeInitiator,
    };
  }
}
