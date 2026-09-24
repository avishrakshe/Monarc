import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, http, type WalletClient, type Account } from "viem";
import { monadTestnet } from "./network.js";
import { config } from "./config.js";

export interface AgentEmbeddedWalletInfo {
  address: `0x${string}`;
  type: "DYNAMIC_EMBEDDED" | "PRIVATE_KEY";
  dynamicEnvironmentId: string;
}

/**
 * Dynamic Embedded Wallet Manager for Monarc Autonomous Agents
 * Coordinates autonomous agent keys and Dynamic wallet authorization
 */
export class DynamicWalletManager {
  private readonly environmentId: string;
  private readonly account: Account;
  public readonly walletClient: WalletClient;

  constructor(customPrivateKey?: `0x${string}`) {
    this.environmentId = config.dynamic.environmentId;
    const pk = customPrivateKey || config.privateKey;
    this.account = privateKeyToAccount(pk);

    this.walletClient = createWalletClient({
      account: this.account,
      chain: monadTestnet,
      transport: http(config.alchemyRpcUrl || config.monadRpcUrl),
    });
  }

  get address(): `0x${string}` {
    return this.account.address;
  }

  getWalletInfo(): AgentEmbeddedWalletInfo {
    return {
      address: this.account.address,
      type: this.environmentId ? "DYNAMIC_EMBEDDED" : "PRIVATE_KEY",
      dynamicEnvironmentId: this.environmentId,
    };
  }

  getAccount(): Account {
    return this.account;
  }
}
