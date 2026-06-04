import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { StructuredLogger } from "../../common/logging/structured-logger.service";

const selectors = {
  totalAssets: "0x01e1d114",
  sharePrice: "0x87269729",
  paused: "0x5c975abb",
  strategiesPaused: "0x14894141",
  emergencyShutdown: "0x3403c2fc",
  idleLiquidityBps: "0x77b26d46",
  totalSupply: "0x18160ddd",
  asset: "0x38d52e0f",
  balanceOf: "0x70a08231"
} as const;

export interface OnChainVaultSnapshot {
  source: "onchain";
  chainId: number;
  vaultAddress: string;
  assetAddress: string;
  totalAssets: bigint;
  sharePrice: bigint;
  availableLiquidity: bigint;
  totalSupply: bigint;
  idleLiquidityBps: bigint;
  paused: boolean;
  strategiesPaused: boolean;
  emergencyShutdown: boolean;
}

export interface OnChainAddressConfig {
  rpcConfigured: boolean;
  vaultAddress: string | null;
  controllerAddress: string | null;
  treasuryAddress: string | null;
  usdcAddress: string | null;
  eurcAddress: string | null;
}

export interface OnChainContractStatus {
  name: "OrvexVault" | "OrvexController" | "OrvexTreasury" | "USDC" | "EURC";
  address: string | null;
  configured: boolean;
  hasCode: boolean | null;
  status: "not_configured" | "ok" | "missing_code";
}

export interface RpcStatus {
  status: "not_configured" | "ok";
  chainId: number | null;
  provider: "json-rpc";
}

@Injectable()
export class VaultChainService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: StructuredLogger
  ) {}

  getConfiguredAddresses(): OnChainAddressConfig {
    return {
      rpcConfigured: Boolean(this.getRpcUrl()),
      vaultAddress: this.getOptionalAddress("ORVEX_VAULT_ADDRESS"),
      controllerAddress: this.getOptionalAddress("ORVEX_CONTROLLER_ADDRESS"),
      treasuryAddress: this.getOptionalAddress("ORVEX_TREASURY_ADDRESS"),
      usdcAddress: this.getOptionalAddress("USDC_ADDRESS"),
      eurcAddress: this.getOptionalAddress("EURC_ADDRESS")
    };
  }

  async getRpcStatus(): Promise<RpcStatus> {
    const rpcUrl = this.getRpcUrl();
    if (!rpcUrl) {
      return {
        status: "not_configured",
        chainId: null,
        provider: "json-rpc"
      };
    }

    const chainId = await this.readChainId(rpcUrl);
    this.logger.info({
      event: "rpc.health.read",
      source: "backend-rpc",
      result: "success",
      metadata: { chainId }
    });

    return {
      status: "ok",
      chainId,
      provider: "json-rpc"
    };
  }

  async getContractStatuses(): Promise<OnChainContractStatus[]> {
    const rpcUrl = this.getRpcUrl();
    const config = this.getConfiguredAddresses();
    const contracts: Array<{
      name: OnChainContractStatus["name"];
      address: string | null;
    }> = [
      { name: "OrvexVault", address: config.vaultAddress },
      { name: "OrvexController", address: config.controllerAddress },
      { name: "OrvexTreasury", address: config.treasuryAddress },
      { name: "USDC", address: config.usdcAddress },
      { name: "EURC", address: config.eurcAddress }
    ];

    if (!rpcUrl) {
      return contracts.map((contract) => ({
        ...contract,
        configured: Boolean(contract.address),
        hasCode: null,
        status: "not_configured"
      }));
    }

    return Promise.all(
      contracts.map(async (contract) => {
        if (!contract.address) {
          return {
            ...contract,
            configured: false,
            hasCode: null,
            status: "not_configured" as const
          };
        }

        const hasCode = await this.hasContractCode(rpcUrl, contract.address);
        return {
          ...contract,
          configured: true,
          hasCode,
          status: hasCode ? ("ok" as const) : ("missing_code" as const)
        };
      })
    );
  }

  async getVaultSnapshot(): Promise<OnChainVaultSnapshot | null> {
    const rpcUrl = this.getRpcUrl();
    const vaultAddress = this.getOptionalAddress("ORVEX_VAULT_ADDRESS");

    if (!rpcUrl || !vaultAddress) return null;

    const chainId = await this.readChainId(rpcUrl);
    const normalizedVault = vaultAddress;
    const assetAddress = await this.readAddress(rpcUrl, normalizedVault, selectors.asset);

    const [
      totalAssets,
      sharePrice,
      availableLiquidity,
      totalSupply,
      idleLiquidityBps,
      paused,
      strategiesPaused,
      emergencyShutdown
    ] = await Promise.all([
      this.readUint(rpcUrl, normalizedVault, selectors.totalAssets),
      this.readUint(rpcUrl, normalizedVault, selectors.sharePrice),
      this.readUint(
        rpcUrl,
        assetAddress,
        `${selectors.balanceOf}${encodeAddress(normalizedVault)}`
      ),
      this.readUint(rpcUrl, normalizedVault, selectors.totalSupply),
      this.readUint(rpcUrl, normalizedVault, selectors.idleLiquidityBps),
      this.readBool(rpcUrl, normalizedVault, selectors.paused),
      this.readBool(rpcUrl, normalizedVault, selectors.strategiesPaused),
      this.readBool(rpcUrl, normalizedVault, selectors.emergencyShutdown)
    ]);

    const snapshot: OnChainVaultSnapshot = {
      source: "onchain",
      chainId,
      vaultAddress: normalizedVault,
      assetAddress,
      totalAssets,
      sharePrice,
      availableLiquidity,
      totalSupply,
      idleLiquidityBps,
      paused,
      strategiesPaused,
      emergencyShutdown
    };

    this.logger.info({
      event: "vault.onchain.read",
      source: "backend-rpc",
      result: "success",
      metadata: {
        chainId,
        vaultAddress: normalizedVault,
        assetAddress
      }
    });

    return snapshot;
  }

  private getRpcUrl() {
    return this.configService.get<string>("ORVEX_RPC_URL")?.trim() || null;
  }

  private getOptionalAddress(key: string) {
    const value = this.configService.get<string>(key)?.trim();
    if (!value) return null;
    return normalizeAddress(value);
  }

  private async readChainId(rpcUrl: string) {
    return Number(await this.rpcRequest(rpcUrl, "eth_chainId", []));
  }

  private async hasContractCode(rpcUrl: string, address: string) {
    const code = await this.rpcRequest(rpcUrl, "eth_getCode", [address, "latest"]);
    return code !== "0x";
  }

  private async readUint(
    rpcUrl: string,
    to: string,
    data: string
  ): Promise<bigint> {
    return BigInt(await this.ethCall(rpcUrl, to, data));
  }

  private async readBool(
    rpcUrl: string,
    to: string,
    data: string
  ): Promise<boolean> {
    return (await this.readUint(rpcUrl, to, data)) === 1n;
  }

  private async readAddress(
    rpcUrl: string,
    to: string,
    data: string
  ): Promise<string> {
    const result = await this.ethCall(rpcUrl, to, data);
    return normalizeAddress(`0x${result.slice(-40)}`);
  }

  private async ethCall(
    rpcUrl: string,
    to: string,
    data: string
  ): Promise<string> {
    return this.rpcRequest(rpcUrl, "eth_call", [{ to, data }, "latest"]);
  }

  private async rpcRequest(
    rpcUrl: string,
    method: string,
    params: unknown[]
  ): Promise<string> {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method,
        params
      })
    });

    if (!response.ok) {
      throw new Error(`RPC_HTTP_${response.status}`);
    }

    const payload = (await response.json()) as {
      error?: { message?: string };
      result?: string;
    };

    if (payload.error || !payload.result) {
      this.logger.error({
        event: "rpc.read.error",
        source: "backend-rpc",
        result: "failure",
        metadata: { method, error: payload.error?.message ?? "RPC_EMPTY_RESULT" }
      });
      throw new Error(payload.error?.message ?? "RPC_EMPTY_RESULT");
    }

    return payload.result;
  }
}

function encodeAddress(address: string) {
  return address.slice(2).padStart(64, "0");
}

function normalizeAddress(address: string) {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error("INVALID_ADDRESS");
  }

  return address.toLowerCase();
}
