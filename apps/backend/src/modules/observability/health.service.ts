import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { VaultChainService } from "../vault/vault-chain.service";

@Injectable()
export class HealthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly vaultChainService: VaultChainService
  ) {}

  getBackendHealth() {
    return {
      status: "ok",
      service: "orvex-backend",
      timestamp: new Date().toISOString()
    };
  }

  async getDatabaseHealth() {
    try {
      return await this.databaseService.ping();
    } catch (error) {
      return {
        status: "error" as const,
        latencyMs: null,
        error: error instanceof Error ? error.message : "DATABASE_HEALTH_ERROR"
      };
    }
  }

  async getRpcHealth() {
    try {
      const rpc = await this.vaultChainService.getRpcStatus();
      if (rpc.status === "not_configured") return rpc;

      const contracts = await this.vaultChainService.getContractStatuses();
      return {
        status: "ok" as const,
        chainId: rpc.chainId,
        provider: rpc.provider,
        contracts
      };
    } catch (error) {
      return {
        status: "error" as const,
        error: error instanceof Error ? error.message : "RPC_HEALTH_ERROR"
      };
    }
  }

  async getFullHealth() {
    const [database, rpc] = await Promise.all([
      this.getDatabaseHealth(),
      this.getRpcHealth()
    ]);

    return {
      backend: this.getBackendHealth(),
      database,
      rpc
    };
  }
}
