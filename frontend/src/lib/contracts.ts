import { defineChain } from "viem";

export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "MON",
    symbol: "MON",
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.monad.xyz"],
    },
    public: {
      http: ["https://testnet-rpc.monad.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "MonadExplorer",
      url: "https://testnet.monadexplorer.com",
    },
  },
  testnet: true,
});

export const CONTRACT_ADDRESSES = {
  identityRegistry: (process.env.NEXT_PUBLIC_IDENTITY_REGISTRY || "0x5FbDB2315678afecb367f032d93F642f64180aa3") as `0x${string}`,
  reputationRegistry: (process.env.NEXT_PUBLIC_REPUTATION_REGISTRY || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512") as `0x${string}`,
  paymentSettlement: (process.env.NEXT_PUBLIC_PAYMENT_SETTLEMENT || "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0") as `0x${string}`,
  validationRegistry: (process.env.NEXT_PUBLIC_VALIDATION_REGISTRY || "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9") as `0x${string}`,
};

export const PAYMENT_SETTLEMENT_ABI = [
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
] as const;

export const IDENTITY_REGISTRY_ABI = [
  {
    type: "function",
    name: "registerAgent",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agentCardURI", type: "string" },
      { name: "walletAddress", type: "address" },
    ],
    outputs: [{ name: "agentId", type: "uint256" }],
  },
  {
    type: "function",
    name: "getAgent",
    stateMutability: "view",
    inputs: [{ name: "agentId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "owner", type: "address" },
          { name: "walletAddress", type: "address" },
          { name: "agentCardURI", type: "string" },
          { name: "isCleanverseVerified", type: "bool" },
          { name: "registeredAt", type: "uint256" },
        ],
      },
    ],
  },
] as const;
