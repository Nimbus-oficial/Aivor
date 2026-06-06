import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { StructuredLogger } from "../../common/logging/structured-logger.service";
import type { GovernanceMode } from "../database/types/database.types";

export interface GovernanceConfig {
  mode: GovernanceMode;
  safeAddress: string | null;
  safeChainId: number | null;
  safeApiUrl: string | null;
  timelockAddress: string | null;
}

interface SafeApiPayload {
  address?: string;
  nonce?: number;
  threshold?: number;
  owners?: string[];
  masterCopy?: string;
  modules?: string[];
  fallbackHandler?: string;
  guard?: string;
  version?: string;
}

@Injectable()
export class SafeReadonlyService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: StructuredLogger
  ) {}

  getConfig(): GovernanceConfig {
    return {
      mode: this.getMode(),
      safeAddress: this.getOptionalAddress("SAFE_ADDRESS"),
      safeChainId: this.getOptionalNumber("SAFE_CHAIN_ID"),
      safeApiUrl: this.configService.get<string>("SAFE_API_URL")?.trim() || null,
      timelockAddress: this.getOptionalAddress("TIMELOCK_ADDRESS")
    };
  }

  async getStatus() {
    const config = this.getConfig();
    const rpcChainId = await this.getRpcChainId();
    const safeApiStatus = await this.getSafeApiStatus(config);
    const chainIdMatchesRpc =
      config.safeChainId && rpcChainId ? config.safeChainId === rpcChainId : null;
    const expectedPolicy = {
      threshold: 2,
      owners: 4
    };
    const policyMatches =
      typeof safeApiStatus.threshold === "number" && Array.isArray(safeApiStatus.owners)
        ? safeApiStatus.threshold === expectedPolicy.threshold &&
          safeApiStatus.owners.length === expectedPolicy.owners
        : null;

    return {
      mode: config.mode,
      safe: {
        address: config.safeAddress,
        chainId: config.safeChainId,
        configured: Boolean(config.safeAddress && config.safeChainId),
        rpcChainId,
        chainIdMatchesRpc,
        expectedPolicy,
        policyMatches,
        api: safeApiStatus
      },
      timelock: {
        address: config.timelockAddress,
        configured: Boolean(config.timelockAddress)
      },
      status: this.getGovernanceReadiness({
        config,
        chainIdMatchesRpc,
        safeApiStatus,
        policyMatches
      }),
      execution: {
        realOnchainExecutionEnabled: false,
        signingEnabled: false,
        custodyEnabled: false
      }
    };
  }

  private getMode(): GovernanceMode {
    const value = this.configService.get<string>("GOVERNANCE_MODE")?.trim();
    if (value === "safe_readonly") return "safe_readonly";
    return "simulated";
  }

  private getOptionalAddress(key: string) {
    const value = this.configService.get<string>(key)?.trim();
    if (!value) return null;
    if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
      throw new Error(`${key} must be a valid EVM address`);
    }
    return value;
  }

  private getOptionalNumber(key: string) {
    const value = this.configService.get<string>(key)?.trim();
    if (!value) return null;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new Error(`${key} must be a positive integer`);
    }
    return parsed;
  }

  private async getRpcChainId() {
    const rpcUrl = this.configService.get<string>("ORVEX_RPC_URL")?.trim();
    if (!rpcUrl) return null;

    try {
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_chainId",
          params: []
        })
      });

      const payload = (await response.json()) as { result?: string };
      return payload.result ? Number(payload.result) : null;
    } catch (error) {
      this.logger.warn({
        event: "governance.rpc_status.read_failed",
        source: "backend-governance",
        result: "failure",
        metadata: {
          reason: error instanceof Error ? error.message : "unknown"
        }
      });
      return null;
    }
  }

  private async getSafeApiStatus(config: GovernanceConfig) {
    if (config.mode !== "safe_readonly" || !config.safeApiUrl || !config.safeAddress) {
      return {
        configured: Boolean(config.safeApiUrl),
        reachable: null,
        safeFound: null,
        owners: null,
        threshold: null,
        nonce: null,
        version: null,
        modules: null,
        guard: null,
        fallbackHandler: null
      };
    }

    const baseUrl = config.safeApiUrl.replace(/\/$/, "");
    const url = `${baseUrl}/api/v1/safes/${config.safeAddress}/`;

    try {
      const response = await fetch(url, {
        headers: { accept: "application/json" }
      });

      const payload = response.ok ? ((await response.json()) as SafeApiPayload) : null;
      const owners = payload?.owners?.map((owner) => owner.toLowerCase()) ?? null;

      const status = {
        configured: true,
        reachable: response.ok,
        safeFound: response.ok,
        statusCode: response.status,
        address: payload?.address?.toLowerCase() ?? null,
        owners,
        threshold: payload?.threshold ?? null,
        nonce: payload?.nonce ?? null,
        version: payload?.version ?? null,
        modules: payload?.modules ?? null,
        guard: payload?.guard ?? null,
        fallbackHandler: payload?.fallbackHandler ?? null
      };

      this.logger.info({
        event: "governance.safe_status.read",
        source: "backend-governance",
        result: response.ok ? "success" : "failure",
        metadata: {
          safeAddress: config.safeAddress,
          statusCode: response.status,
          threshold: status.threshold,
          owners: owners?.length ?? null
        }
      });

      return status;
    } catch (error) {
      this.logger.warn({
        event: "governance.safe_read_failed",
        source: "backend-governance",
        result: "failure",
        metadata: {
          reason: error instanceof Error ? error.message : "unknown"
        }
      });

      return {
        configured: true,
        reachable: false,
        safeFound: null,
        owners: null,
        threshold: null,
        nonce: null,
        version: null,
        modules: null,
        guard: null,
        fallbackHandler: null
      };
    }
  }

  private getGovernanceReadiness(input: {
    config: GovernanceConfig;
    chainIdMatchesRpc: boolean | null;
    safeApiStatus: Awaited<ReturnType<SafeReadonlyService["getSafeApiStatus"]>>;
    policyMatches: boolean | null;
  }) {
    if (input.config.mode !== "safe_readonly") return "simulated";
    if (!input.config.safeAddress || !input.config.safeChainId) return "not_configured";
    if (input.safeApiStatus.reachable === false || input.safeApiStatus.safeFound === false) {
      return "safe_unreachable";
    }
    if (input.chainIdMatchesRpc === false) return "chain_mismatch";
    if (input.policyMatches === false) return "policy_mismatch";
    if (input.safeApiStatus.safeFound && input.policyMatches === true) return "ok";
    return "pending";
  }
}
