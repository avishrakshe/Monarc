/**
 * Envio HyperIndex Event Handlers for Monarc on Monad Testnet
 * Processes real-time on-chain events from ERC-8004 Identity & Reputation
 * and Machine Payments Protocol (x402) PaymentSettlement.
 */

export interface EventContext {
  agent: {
    get: (id: string) => Promise<AgentEntity | null>;
    set: (entity: AgentEntity) => void;
  };
  feedback: {
    set: (entity: FeedbackEntity) => void;
  };
  job: {
    get: (id: string) => Promise<JobEntity | null>;
    set: (entity: JobEntity) => void;
  };
  protocolStats: {
    get: (id: string) => Promise<ProtocolStatsEntity | null>;
    set: (entity: ProtocolStatsEntity) => void;
  };
}

export interface AgentEntity {
  id: string;
  agentId: bigint;
  owner: string;
  walletAddress: string;
  agentCardURI: string;
  isCleanverseVerified: boolean;
  totalCompletedJobs: bigint;
  totalDisputedJobs: bigint;
  totalEarned: bigint;
  averageScore: number;
  feedbackCount: bigint;
  registeredAt: bigint;
}

export interface FeedbackEntity {
  id: string;
  agent_id: string;
  reviewer: string;
  score: number;
  tag: string;
  comments: string;
  jobHash: string;
  timestamp: bigint;
}

export interface JobEntity {
  id: string;
  jobId: bigint;
  employerAgent_id: string;
  workerAgent_id: string;
  employerWallet: string;
  workerWallet: string;
  paymentAmount: bigint;
  workerStakeRequired: bigint;
  workerStakeDeposited: bigint;
  challengePeriodSeconds: bigint;
  challengeDeadline?: bigint;
  status: "CREATED" | "ACCEPTED" | "DELIVERED" | "SETTLED" | "DISPUTED" | "RESOLVED" | "CANCELLED";
  jobSpecHash: string;
  deliveryHash?: string;
  deliveryURI?: string;
  disputeInitiator?: string;
  disputeReason?: string;
  disputeFavorWorker?: boolean;
  disputeResolutionNotes?: string;
  createdAt: bigint;
  deliveredAt?: bigint;
  settledAt?: bigint;
}

export interface ProtocolStatsEntity {
  id: string;
  totalVolume: bigint;
  totalJobs: bigint;
  settledJobs: bigint;
  disputedJobs: bigint;
  totalAgentsRegistered: bigint;
  cleanverseVerifiedAgents: bigint;
}

async function getOrCreateProtocolStats(context: EventContext): Promise<ProtocolStatsEntity> {
  const existing = await context.protocolStats.get("global");
  if (existing) return existing;
  const initial: ProtocolStatsEntity = {
    id: "global",
    totalVolume: 0n,
    totalJobs: 0n,
    settledJobs: 0n,
    disputedJobs: 0n,
    totalAgentsRegistered: 0n,
    cleanverseVerifiedAgents: 0n,
  };
  context.protocolStats.set(initial);
  return initial;
}

// ==============================================================================
// 1. IdentityRegistry Handlers (ERC-8004)
// ==============================================================================

export async function handleAgentRegistered(
  event: {
    params: {
      agentId: bigint;
      owner: string;
      walletAddress: string;
      agentCardURI: string;
    };
    block: { timestamp: number };
  },
  context: EventContext
): Promise<void> {
  const agentIdStr = event.params.agentId.toString();
  const agent: AgentEntity = {
    id: agentIdStr,
    agentId: event.params.agentId,
    owner: event.params.owner.toLowerCase(),
    walletAddress: event.params.walletAddress.toLowerCase(),
    agentCardURI: event.params.agentCardURI,
    isCleanverseVerified: false,
    totalCompletedJobs: 0n,
    totalDisputedJobs: 0n,
    totalEarned: 0n,
    averageScore: 0,
    feedbackCount: 0n,
    registeredAt: BigInt(event.block.timestamp),
  };
  context.agent.set(agent);

  const stats = await getOrCreateProtocolStats(context);
  stats.totalAgentsRegistered += 1n;
  context.protocolStats.set(stats);
}

export async function handleAgentCardUpdated(
  event: {
    params: {
      agentId: bigint;
      newURI: string;
    };
  },
  context: EventContext
): Promise<void> {
  const agent = await context.agent.get(event.params.agentId.toString());
  if (agent) {
    agent.agentCardURI = event.params.newURI;
    context.agent.set(agent);
  }
}

export async function handleCleanverseVerificationUpdated(
  event: {
    params: {
      agentId: bigint;
      verified: boolean;
    };
  },
  context: EventContext
): Promise<void> {
  const agent = await context.agent.get(event.params.agentId.toString());
  if (agent) {
    const wasVerified = agent.isCleanverseVerified;
    agent.isCleanverseVerified = event.params.verified;
    context.agent.set(agent);

    const stats = await getOrCreateProtocolStats(context);
    if (!wasVerified && event.params.verified) {
      stats.cleanverseVerifiedAgents += 1n;
    } else if (wasVerified && !event.params.verified) {
      stats.cleanverseVerifiedAgents -= 1n;
    }
    context.protocolStats.set(stats);
  }
}

// ==============================================================================
// 2. ReputationRegistry Handlers (ERC-8004)
// ==============================================================================

export async function handleFeedbackSubmitted(
  event: {
    params: {
      agentId: bigint;
      reviewer: string;
      score: number;
      tag: string;
      jobHash: string;
    };
    block: { timestamp: number };
    transaction: { hash: string };
  },
  context: EventContext
): Promise<void> {
  const agentIdStr = event.params.agentId.toString();
  const agent = await context.agent.get(agentIdStr);

  if (agent) {
    const currentCount = Number(agent.feedbackCount);
    const newAverage = Math.round(
      (agent.averageScore * currentCount + event.params.score) / (currentCount + 1)
    );
    agent.averageScore = newAverage;
    agent.feedbackCount += 1n;
    context.agent.set(agent);
  }

  const feedbackId = `${agentIdStr}-${event.transaction.hash}`;
  const feedback: FeedbackEntity = {
    id: feedbackId,
    agent_id: agentIdStr,
    reviewer: event.params.reviewer.toLowerCase(),
    score: event.params.score,
    tag: event.params.tag,
    comments: "",
    jobHash: event.params.jobHash,
    timestamp: BigInt(event.block.timestamp),
  };
  context.feedback.set(feedback);
}

export async function handleJobSettlementRecorded(
  event: {
    params: {
      agentId: bigint;
      paymentAmount: bigint;
      success: boolean;
    };
  },
  context: EventContext
): Promise<void> {
  const agent = await context.agent.get(event.params.agentId.toString());
  if (agent) {
    if (event.params.success) {
      agent.totalCompletedJobs += 1n;
      agent.totalEarned += event.params.paymentAmount;
    } else {
      agent.totalDisputedJobs += 1n;
    }
    context.agent.set(agent);
  }
}

// ==============================================================================
// 3. PaymentSettlement Handlers (x402)
// ==============================================================================

export async function handleJobCreated(
  event: {
    params: {
      jobId: bigint;
      employerAgentId: bigint;
      workerAgentId: bigint;
      paymentAmount: bigint;
      workerStakeRequired: bigint;
      challengePeriodSeconds: bigint;
    };
    block: { timestamp: number };
  },
  context: EventContext
): Promise<void> {
  const jobIdStr = event.params.jobId.toString();
  const employerAgent = await context.agent.get(event.params.employerAgentId.toString());
  const workerAgent = await context.agent.get(event.params.workerAgentId.toString());

  const job: JobEntity = {
    id: jobIdStr,
    jobId: event.params.jobId,
    employerAgent_id: event.params.employerAgentId.toString(),
    workerAgent_id: event.params.workerAgentId.toString(),
    employerWallet: employerAgent?.walletAddress ?? "",
    workerWallet: workerAgent?.walletAddress ?? "",
    paymentAmount: event.params.paymentAmount,
    workerStakeRequired: event.params.workerStakeRequired,
    workerStakeDeposited: 0n,
    challengePeriodSeconds: event.params.challengePeriodSeconds,
    status: "CREATED",
    jobSpecHash: "",
    createdAt: BigInt(event.block.timestamp),
  };
  context.job.set(job);

  const stats = await getOrCreateProtocolStats(context);
  stats.totalJobs += 1n;
  stats.totalVolume += event.params.paymentAmount;
  context.protocolStats.set(stats);
}

export async function handleJobAccepted(
  event: {
    params: {
      jobId: bigint;
      workerAgentId: bigint;
      stakeDeposited: bigint;
    };
  },
  context: EventContext
): Promise<void> {
  const job = await context.job.get(event.params.jobId.toString());
  if (job) {
    job.status = "ACCEPTED";
    job.workerStakeDeposited = event.params.stakeDeposited;
    context.job.set(job);
  }
}

export async function handleDeliverySubmitted(
  event: {
    params: {
      jobId: bigint;
      deliveryHash: string;
      deliveryURI: string;
      challengeDeadline: bigint;
    };
    block: { timestamp: number };
  },
  context: EventContext
): Promise<void> {
  const job = await context.job.get(event.params.jobId.toString());
  if (job) {
    job.status = "DELIVERED";
    job.deliveryHash = event.params.deliveryHash;
    job.deliveryURI = event.params.deliveryURI;
    job.challengeDeadline = event.params.challengeDeadline;
    job.deliveredAt = BigInt(event.block.timestamp);
    context.job.set(job);
  }
}

export async function handleJobSettled(
  event: {
    params: {
      jobId: bigint;
      workerWallet: string;
      totalPayout: bigint;
    };
    block: { timestamp: number };
  },
  context: EventContext
): Promise<void> {
  const job = await context.job.get(event.params.jobId.toString());
  if (job) {
    job.status = "SETTLED";
    job.settledAt = BigInt(event.block.timestamp);
    context.job.set(job);

    const stats = await getOrCreateProtocolStats(context);
    stats.settledJobs += 1n;
    context.protocolStats.set(stats);
  }
}

export async function handleDisputeRaised(
  event: {
    params: {
      jobId: bigint;
      disputer: string;
      reason: string;
    };
  },
  context: EventContext
): Promise<void> {
  const job = await context.job.get(event.params.jobId.toString());
  if (job) {
    job.status = "DISPUTED";
    job.disputeInitiator = event.params.disputer.toLowerCase();
    job.disputeReason = event.params.reason;
    context.job.set(job);

    const stats = await getOrCreateProtocolStats(context);
    stats.disputedJobs += 1n;
    context.protocolStats.set(stats);
  }
}

export async function handleDisputeResolved(
  event: {
    params: {
      jobId: bigint;
      favorWorker: boolean;
      resolutionNotes: string;
    };
  },
  context: EventContext
): Promise<void> {
  const job = await context.job.get(event.params.jobId.toString());
  if (job) {
    job.status = "RESOLVED";
    job.disputeFavorWorker = event.params.favorWorker;
    job.disputeResolutionNotes = event.params.resolutionNotes;
    context.job.set(job);
  }
}

export async function handleJobCancelled(
  event: {
    params: {
      jobId: bigint;
    };
  },
  context: EventContext
): Promise<void> {
  const job = await context.job.get(event.params.jobId.toString());
  if (job) {
    job.status = "CANCELLED";
    context.job.set(job);
  }
}
