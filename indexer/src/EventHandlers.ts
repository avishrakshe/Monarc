/**
 * Envio HyperIndex Event Handlers for Monarc
 * Indexes AgentRegistered, JobCreated, DeliveryConfirmed, DeliveryDisputed, and Slashed events.
 */

export interface EventContext {
  agent: {
    get: (id: string) => Promise<AgentEntity | null>;
    set: (entity: AgentEntity) => void;
  };
  job: {
    get: (id: string) => Promise<JobEntity | null>;
    set: (entity: JobEntity) => void;
  };
  slashEvent: {
    set: (entity: SlashEntity) => void;
  };
  marketplaceProtocolStats: {
    get: (id: string) => Promise<StatsEntity | null>;
    set: (entity: StatsEntity) => void;
  };
}

export interface AgentEntity {
  id: string;
  agentId: bigint;
  owner: string;
  verifiedAt: bigint;
  totalJobsAsPoster: bigint;
  totalJobsAsWorker: bigint;
  successfulJobs: bigint;
  failedJobs: bigint;
  nansenScore: bigint;
  activeStake: bigint;
  slashedCount: bigint;
}

export interface JobEntity {
  id: string;
  jobId: bigint;
  poster_id: string;
  worker_id?: string;
  amount: bigint;
  deliverableSpec: string;
  proofHash?: string;
  challengeDeadline?: bigint;
  status: "CREATED" | "ACCEPTED" | "DELIVERED" | "CONFIRMED" | "DISPUTED" | "RESOLVED";
  disputer?: string;
  winnerId?: bigint;
  loserId?: bigint;
  slashedAmount?: bigint;
  createdAt: bigint;
  deliveredAt?: bigint;
  confirmedAt?: bigint;
  disputedAt?: bigint;
  resolvedAt?: bigint;
}

export interface SlashEntity {
  id: string;
  agent_id: string;
  amount: bigint;
  reason: string;
  recipient: string;
  timestamp: bigint;
}

export interface StatsEntity {
  id: string;
  totalRegisteredAgents: bigint;
  totalJobsCreated: bigint;
  totalJobsConfirmed: bigint;
  totalJobsDisputed: bigint;
  totalVolumeEscrowed: bigint;
  totalVolumeSettled: bigint;
  totalCollateralSlashed: bigint;
}

async function getOrCreateStats(context: EventContext): Promise<StatsEntity> {
  const existing = await context.marketplaceProtocolStats.get("global");
  if (existing) return existing;
  const initial: StatsEntity = {
    id: "global",
    totalRegisteredAgents: 0n,
    totalJobsCreated: 0n,
    totalJobsConfirmed: 0n,
    totalJobsDisputed: 0n,
    totalVolumeEscrowed: 0n,
    totalVolumeSettled: 0n,
    totalCollateralSlashed: 0n,
  };
  context.marketplaceProtocolStats.set(initial);
  return initial;
}

// ==============================================================================
// 1. IdentityRegistry Handlers
// ==============================================================================

export async function handleAgentRegistered(
  event: {
    params: {
      agentId: bigint;
      owner: string;
      verifiedAt: bigint;
    };
  },
  context: EventContext
): Promise<void> {
  const agentIdStr = event.params.agentId.toString();
  const agent: AgentEntity = {
    id: agentIdStr,
    agentId: event.params.agentId,
    owner: event.params.owner.toLowerCase(),
    verifiedAt: event.params.verifiedAt,
    totalJobsAsPoster: 0n,
    totalJobsAsWorker: 0n,
    successfulJobs: 0n,
    failedJobs: 0n,
    nansenScore: 0n,
    activeStake: 0n,
    slashedCount: 0n,
  };
  context.agent.set(agent);

  const stats = await getOrCreateStats(context);
  stats.totalRegisteredAgents += 1n;
  context.marketplaceProtocolStats.set(stats);
}

// ==============================================================================
// 2. PaymentSettlement Handlers
// ==============================================================================

export async function handleJobCreated(
  event: {
    params: {
      jobId: bigint;
      posterId: bigint;
      amount: bigint;
      deliverableSpec: string;
    };
    block: { timestamp: number };
  },
  context: EventContext
): Promise<void> {
  const jobIdStr = event.params.jobId.toString();
  const posterIdStr = event.params.posterId.toString();

  const job: JobEntity = {
    id: jobIdStr,
    jobId: event.params.jobId,
    poster_id: posterIdStr,
    amount: event.params.amount,
    deliverableSpec: event.params.deliverableSpec,
    status: "CREATED",
    createdAt: BigInt(event.block.timestamp),
  };
  context.job.set(job);

  const poster = await context.agent.get(posterIdStr);
  if (poster) {
    poster.totalJobsAsPoster += 1n;
    context.agent.set(poster);
  }

  const stats = await getOrCreateStats(context);
  stats.totalJobsCreated += 1n;
  stats.totalVolumeEscrowed += event.params.amount;
  context.marketplaceProtocolStats.set(stats);
}

export async function handleJobAccepted(
  event: {
    params: {
      jobId: bigint;
      workerId: bigint;
    };
  },
  context: EventContext
): Promise<void> {
  const job = await context.job.get(event.params.jobId.toString());
  if (job) {
    job.worker_id = event.params.workerId.toString();
    job.status = "ACCEPTED";
    context.job.set(job);

    const worker = await context.agent.get(event.params.workerId.toString());
    if (worker) {
      worker.totalJobsAsWorker += 1n;
      context.agent.set(worker);
    }
  }
}

export async function handleDeliverySubmitted(
  event: {
    params: {
      jobId: bigint;
      proofHash: string;
      challengeDeadline: bigint;
    };
    block: { timestamp: number };
  },
  context: EventContext
): Promise<void> {
  const job = await context.job.get(event.params.jobId.toString());
  if (job) {
    job.proofHash = event.params.proofHash;
    job.challengeDeadline = event.params.challengeDeadline;
    job.status = "DELIVERED";
    job.deliveredAt = BigInt(event.block.timestamp);
    context.job.set(job);
  }
}

export async function handleDeliveryConfirmed(
  event: {
    params: {
      jobId: bigint;
      workerWallet: string;
      amount: bigint;
    };
    block: { timestamp: number };
  },
  context: EventContext
): Promise<void> {
  const job = await context.job.get(event.params.jobId.toString());
  if (job) {
    job.status = "CONFIRMED";
    job.confirmedAt = BigInt(event.block.timestamp);
    context.job.set(job);

    const stats = await getOrCreateStats(context);
    stats.totalJobsConfirmed += 1n;
    stats.totalVolumeSettled += event.params.amount;
    context.marketplaceProtocolStats.set(stats);
  }
}

export async function handleDeliveryDisputed(
  event: {
    params: {
      jobId: bigint;
      disputer: string;
    };
    block: { timestamp: number };
  },
  context: EventContext
): Promise<void> {
  const job = await context.job.get(event.params.jobId.toString());
  if (job) {
    job.status = "DISPUTED";
    job.disputer = event.params.disputer.toLowerCase();
    job.disputedAt = BigInt(event.block.timestamp);
    context.job.set(job);

    const stats = await getOrCreateStats(context);
    stats.totalJobsDisputed += 1n;
    context.marketplaceProtocolStats.set(stats);
  }
}

export async function handleDisputeResolved(
  event: {
    params: {
      jobId: bigint;
      winnerId: bigint;
      loserId: bigint;
      slashedAmount: bigint;
    };
    block: { timestamp: number };
  },
  context: EventContext
): Promise<void> {
  const job = await context.job.get(event.params.jobId.toString());
  if (job) {
    job.status = "RESOLVED";
    job.winnerId = event.params.winnerId;
    job.loserId = event.params.loserId;
    job.slashedAmount = event.params.slashedAmount;
    job.resolvedAt = BigInt(event.block.timestamp);
    context.job.set(job);
  }
}

// ==============================================================================
// 3. StakeManager Handlers
// ==============================================================================

export async function handleSlashed(
  event: {
    params: {
      agentId: bigint;
      amount: bigint;
      reason: string;
      recipient: string;
    };
    block: { timestamp: number };
    transaction: { hash: string };
  },
  context: EventContext
): Promise<void> {
  const agentIdStr = event.params.agentId.toString();
  const agent = await context.agent.get(agentIdStr);
  if (agent) {
    if (agent.activeStake >= event.params.amount) {
      agent.activeStake -= event.params.amount;
    } else {
      agent.activeStake = 0n;
    }
    agent.slashedCount += 1n;
    context.agent.set(agent);
  }

  const slashId = `${event.transaction.hash}-${agentIdStr}`;
  const slashEntity: SlashEntity = {
    id: slashId,
    agent_id: agentIdStr,
    amount: event.params.amount,
    reason: event.params.reason,
    recipient: event.params.recipient.toLowerCase(),
    timestamp: BigInt(event.block.timestamp),
  };
  context.slashEvent.set(slashEntity);

  const stats = await getOrCreateStats(context);
  stats.totalCollateralSlashed += event.params.amount;
  context.marketplaceProtocolStats.set(stats);
}

export async function handleStaked(
  event: {
    params: {
      agentId: bigint;
      staker: string;
      amount: bigint;
    };
  },
  context: EventContext
): Promise<void> {
  const agent = await context.agent.get(event.params.agentId.toString());
  if (agent) {
    agent.activeStake += event.params.amount;
    context.agent.set(agent);
  }
}

// ==============================================================================
// 4. ReputationRegistry Handlers
// ==============================================================================

export async function handleOutcomeRecorded(
  event: {
    params: {
      agentId: bigint;
      success: boolean;
      counterpartyId: bigint;
      timestamp: bigint;
    };
  },
  context: EventContext
): Promise<void> {
  const agent = await context.agent.get(event.params.agentId.toString());
  if (agent) {
    if (event.params.success) {
      agent.successfulJobs += 1n;
    } else {
      agent.failedJobs += 1n;
    }
    context.agent.set(agent);
  }
}

export async function handleExternalSignalUpdated(
  event: {
    params: {
      agentId: bigint;
      nansenScore: bigint;
      timestamp: bigint;
    };
  },
  context: EventContext
): Promise<void> {
  const agent = await context.agent.get(event.params.agentId.toString());
  if (agent) {
    agent.nansenScore = event.params.nansenScore;
    context.agent.set(agent);
  }
}
