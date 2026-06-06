import { Injectable } from "@nestjs/common";
import { AllocatorChainService } from "../allocator/allocator-chain.service";
import { DatabaseService } from "../database/database.service";
import { SafeReadonlyService } from "../governance/safe-readonly.service";
import { VaultChainService } from "../vault/vault-chain.service";

@Injectable()
export class HealthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly vaultChainService: VaultChainService,
    private readonly safeReadonlyService: SafeReadonlyService,
    private readonly allocatorChainService: AllocatorChainService
  ) {}

  getBackendHealth() {
    return {
      status: "ok",
      service: "aivor-backend",
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

  async getGovernanceHealth() {
    try {
      const governance = await this.safeReadonlyService.getStatus();
      return {
        status:
          governance.status === "ok" ||
          governance.status === "simulated" ||
          governance.status === "not_configured"
            ? "ok"
            : "error",
        governance
      };
    } catch (error) {
      return {
        status: "error" as const,
        error: error instanceof Error ? error.message : "GOVERNANCE_HEALTH_ERROR"
      };
    }
  }

  async getAllocatorHealth() {
    try {
      return await this.allocatorChainService.getHealth();
    } catch (error) {
      return {
        status: "error" as const,
        error: error instanceof Error ? error.message : "ALLOCATOR_HEALTH_ERROR"
      };
    }
  }

  async getFullHealth() {
    const [database, rpc, governance, allocator] = await Promise.all([
      this.getDatabaseHealth(),
      this.getRpcHealth(),
      this.getGovernanceHealth(),
      this.getAllocatorHealth()
    ]);

    return {
      backend: this.getBackendHealth(),
      database,
      rpc,
      governance,
      allocator
    };
  }
}
