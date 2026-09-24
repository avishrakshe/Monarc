import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
dotenv.config();

export interface AgentRuntimeConfig {
  readonly monadRpcUrl: string;
  readonly alchemyRpcUrl: string;
  readonly chainId: number;
  readonly privateKey: `0x${string}`;
  readonly disputeResolverAddress: `0x${string}`;
  readonly contracts: {
    readonly identityRegistry: `0x${string}`;
    readonly reputationRegistry: `0x${string}`;
    readonly paymentSettlement: `0x${string}`;
    readonly validationRegistry: `0x${string}`;
  };
  readonly qwen: {
    readonly apiKey: string;
    readonly model: string;
    readonly baseUrl: string;
  };
  readonly cleanverse: {
    readonly apiKey: string;
    readonly verifierUrl: string;
  };
  readonly nansen: {
    readonly apiKey: string;
    readonly apiUrl: string;
  };
  readonly dynamic: {
    readonly environmentId: string;
  };
  readonly challengePeriodSeconds: number;
}

const defaultPrivateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" as `0x${string}`;
const defaultZeroAddress = "0x0000000000000000000000000000000000000000" as `0x${string}`;

export const config: AgentRuntimeConfig = {
  monadRpcUrl: process.env.MONAD_RPC_URL || "https://testnet-rpc.monad.xyz",
  alchemyRpcUrl:
    process.env.ALCHEMY_MONAD_RPC_URL ||
    (process.env.ALCHEMY_API_KEY
      ? `https://monad-testnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
      : "https://testnet-rpc.monad.xyz"),
  chainId: Number(process.env.MONAD_CHAIN_ID || "10143"),
  privateKey: (process.env.PRIVATE_KEY as `0x${string}`) || defaultPrivateKey,
  disputeResolverAddress: (process.env.DISPUTE_RESOLVER_ADDRESS as `0x${string}`) || defaultZeroAddress,
  contracts: {
    identityRegistry: (process.env.NEXT_PUBLIC_IDENTITY_REGISTRY as `0x${string}`) || defaultZeroAddress,
    reputationRegistry: (process.env.NEXT_PUBLIC_REPUTATION_REGISTRY as `0x${string}`) || defaultZeroAddress,
    paymentSettlement: (process.env.NEXT_PUBLIC_PAYMENT_SETTLEMENT as `0x${string}`) || defaultZeroAddress,
    validationRegistry: (process.env.NEXT_PUBLIC_VALIDATION_REGISTRY as `0x${string}`) || defaultZeroAddress,
  },
  qwen: {
    apiKey: process.env.DASHSCOPE_API_KEY || "",
    model: process.env.QWEN_MODEL || "qwen-3.8-max",
    baseUrl: process.env.DASHSCOPE_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  cleanverse: {
    apiKey: process.env.CLEANVERSE_API_KEY || "",
    verifierUrl: process.env.CLEANVERSE_VERIFIER_URL || "https://api.cleanverse.id/v1/verify",
  },
  nansen: {
    apiKey: process.env.NANSEN_API_KEY || "",
    apiUrl: process.env.NANSEN_API_URL || "https://api.nansen.ai/v1",
  },
  dynamic: {
    environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || "",
  },
  challengePeriodSeconds: Number(process.env.OPTIMISTIC_CHALLENGE_SECONDS || "120"),
};
