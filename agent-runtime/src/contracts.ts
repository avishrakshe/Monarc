export const mockUsdcAbi = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

export const identityRegistryAbi = [
  {
    type: "function",
    name: "register",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agent", type: "address" },
      { name: "name", type: "string" },
      { name: "apiEndpoint", type: "string" },
      { name: "cleanverseProof", type: "bytes" },
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
          { name: "name", type: "string" },
          { name: "apiEndpoint", type: "string" },
          { name: "paymentWallet", type: "address" },
          { name: "registeredAt", type: "uint256" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getAgentIdByWallet",
    stateMutability: "view",
    inputs: [{ name: "agentWallet", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "isRegistered",
    stateMutability: "view",
    inputs: [{ name: "agentId", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export const reputationRegistryAbi = [
  {
    type: "function",
    name: "getReputation",
    stateMutability: "view",
    inputs: [{ name: "agentId", type: "uint256" }],
    outputs: [{ name: "composite", type: "int256" }],
  },
  {
    type: "function",
    name: "getMetrics",
    stateMutability: "view",
    inputs: [{ name: "agentId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "successfulJobs", type: "uint64" },
          { name: "failedJobs", type: "uint64" },
          { name: "nansenScore", type: "int256" },
          { name: "lastNansenUpdate", type: "uint256" },
        ],
      },
    ],
  },
] as const;

export const stakeManagerAbi = [
  {
    type: "function",
    name: "stake",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getStake",
    stateMutability: "view",
    inputs: [{ name: "agentId", type: "uint256" }],
    outputs: [
      { name: "activeStake", type: "uint256" },
      { name: "unbondingAmount", type: "uint256" },
      { name: "releaseTime", type: "uint256" },
    ],
  },
] as const;

export const paymentSettlementAbi = [
  {
    type: "function",
    name: "createJob",
    stateMutability: "nonpayable",
    inputs: [
      { name: "posterId", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "deliverableSpec", type: "bytes32" },
    ],
    outputs: [{ name: "jobId", type: "uint256" }],
  },
  {
    type: "function",
    name: "acceptJob",
    stateMutability: "nonpayable",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "workerId", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "submitDelivery",
    stateMutability: "nonpayable",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "proofHash", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "confirmDelivery",
    stateMutability: "nonpayable",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "disputeDelivery",
    stateMutability: "nonpayable",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "resolveDispute",
    stateMutability: "nonpayable",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "winnerId", type: "uint256" },
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
          { name: "posterId", type: "uint256" },
          { name: "workerId", type: "uint256" },
          { name: "amount", type: "uint256" },
          { name: "deliverableSpec", type: "bytes32" },
          { name: "proofHash", type: "bytes32" },
          { name: "challengeDeadline", type: "uint256" },
          { name: "status", type: "uint8" },
          { name: "disputeInitiator", type: "address" },
        ],
      },
    ],
  },
] as const;
