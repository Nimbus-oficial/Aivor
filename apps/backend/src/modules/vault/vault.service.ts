import { Injectable } from "@nestjs/common";
import { OperationalSettingsRepository } from "../database/repositories/operational-settings.repository";
import { VaultChainService } from "./vault-chain.service";

@Injectable()
export class VaultService {
  constructor(
    private readonly vaultChainService: VaultChainService,
    private readonly operationalSettingsRepository: OperationalSettingsRepository
  ) {}

  async getPublicAccountSummary() {
    const snapshot = await this.getOnChainSnapshotOrNull();

    if (snapshot) {
      return {
        balanceUsd: formatUsdc(snapshot.totalAssets),
        earningsUsd: "US$ 0,00",
        growthLabel: formatSharePrice(snapshot.sharePrice),
        monthlyGrowth: "Dados on-chain",
        withdrawalsEnabled: true
      };
    }

    return {
      balanceUsd: "US$ 12.842,60",
      earningsUsd: "US$ 342,60",
      growthLabel: "+2,74%",
      monthlyGrowth: "+US$ 42,10 este mes",
      withdrawalsEnabled: true
    };
  }

  async getOperationalPolicy() {
    const snapshot = await this.getOnChainSnapshotOrNull();
    const settings = await this.getOperationalSettingsOrNull();
    const liquidityPolicy = readJsonSetting(settings, "liquidity_policy") as
      | { targetBps?: number }
      | null;
    const governancePolicy = readJsonSetting(settings, "governance_policy") as
      | { multisig?: string }
      | null;

    return {
      shareToken: {
        name: "Orvex Yield USDC",
        ticker: "ovUSDC",
        model: "erc4626-share-price",
        rebasing: false
      },
      targetInternalLiquidityBps: snapshot
        ? Number(snapshot.idleLiquidityBps)
        : liquidityPolicy?.targetBps ?? 500,
      targetMorphoAllocationBps: 9500,
      performanceFeeBps: 1500,
      multisigPolicy: governancePolicy?.multisig ?? "Safe 2-of-4",
      timelockDelay: "24h",
      dataSource: snapshot ? "onchain" : settings ? "database" : "mock"
    };
  }

  async getAdminOverview() {
    const snapshot = await this.getOnChainSnapshotOrNull();

    if (snapshot) {
      const idleLiquidityTarget = `${Number(snapshot.idleLiquidityBps) / 100}%`;

      return {
        tvlUsd: formatUsdc(snapshot.totalAssets),
        yieldUsd: "US$ 0,00",
        availableLiquidityUsd: formatUsdc(snapshot.availableLiquidity),
        feesGeneratedUsd: "US$ 0,00",
        deposits24hUsd: "US$ 0,00",
        withdrawals24hUsd: "US$ 0,00",
        contractStatus: getContractStatus(snapshot),
        multisigPolicy: "Safe 2-of-4",
        timelockDelay: "24h",
        idleLiquidityTarget,
        dataSource: "onchain",
        vaultAddress: snapshot.vaultAddress,
        assetAddress: snapshot.assetAddress,
        shareToken: {
          name: "Orvex Yield USDC",
          ticker: "ovUSDC",
          model: "erc4626-share-price",
          rebasing: false
        },
        strategies: [
          {
            name: "Morpho Allocation",
            targetAllocation: `${100 - Number(snapshot.idleLiquidityBps) / 100}%`,
            currentAllocation: "On-chain",
            status: snapshot.strategiesPaused ? "paused" : "active"
          },
          {
            name: "Idle Liquidity",
            targetAllocation: idleLiquidityTarget,
            currentAllocation: formatUsdc(snapshot.availableLiquidity),
            status: snapshot.paused ? "paused" : "active"
          }
        ]
      };
    }

    return {
      tvlUsd: "US$ 18.420.900",
      yieldUsd: "US$ 284.610",
      availableLiquidityUsd: "US$ 1.842.090",
      feesGeneratedUsd: "US$ 42.691",
      deposits24hUsd: "US$ 920.000",
      withdrawals24hUsd: "US$ 310.000",
      contractStatus: "healthy",
      multisigPolicy: "Safe 2-of-4",
      timelockDelay: "24h",
      idleLiquidityTarget: "5%",
      dataSource: "mock",
      shareToken: {
        name: "Orvex Yield USDC",
        ticker: "ovUSDC",
        model: "erc4626-share-price",
        rebasing: false
      },
      strategies: [
        {
          name: "Morpho Market A",
          targetAllocation: "70%",
          currentAllocation: "70%",
          status: "active"
        },
        {
          name: "Morpho Market B",
          targetAllocation: "25%",
          currentAllocation: "25%",
          status: "active"
        },
        {
          name: "Idle Liquidity",
          targetAllocation: "5%",
          currentAllocation: "5%",
          status: "active"
        }
      ]
    };
  }

  getOnChainConfig() {
    return this.vaultChainService.getConfiguredAddresses();
  }

  async getOnChainStatus() {
    const [rpc, contracts] = await Promise.all([
      this.vaultChainService.getRpcStatus(),
      this.vaultChainService.getContractStatuses()
    ]);

    return {
      rpc,
      contracts,
      custody: {
        backendCustodiesFunds: false,
        privateKeysUsedByBackend: false,
        readOnly: true,
        finalFinancialSource: "blockchain"
      }
    };
  }

  async getOnChainVaultData() {
    const snapshot = await this.vaultChainService.getVaultSnapshot();
    if (!snapshot) {
      return {
        status: "not_configured",
        config: this.vaultChainService.getConfiguredAddresses()
      };
    }

    return {
      status: "ok",
      chainId: snapshot.chainId,
      addresses: {
        vault: snapshot.vaultAddress,
        asset: snapshot.assetAddress
      },
      totalAssets: snapshot.totalAssets.toString(),
      totalSupply: snapshot.totalSupply.toString(),
      sharePrice: snapshot.sharePrice.toString(),
      availableLiquidity: snapshot.availableLiquidity.toString(),
      idleLiquidityBps: snapshot.idleLiquidityBps.toString(),
      flags: {
        paused: snapshot.paused,
        strategiesPaused: snapshot.strategiesPaused,
        emergencyShutdown: snapshot.emergencyShutdown
      },
      formatted: {
        totalAssets: formatUsdc(snapshot.totalAssets),
        totalSupply: snapshot.totalSupply.toString(),
        sharePrice: formatSharePrice(snapshot.sharePrice),
        availableLiquidity: formatUsdc(snapshot.availableLiquidity)
      },
      custody: {
        backendCustodiesFunds: false,
        readOnly: true,
        finalFinancialSource: "blockchain"
      }
    };
  }

  private async getOnChainSnapshotOrNull() {
    try {
      return await this.vaultChainService.getVaultSnapshot();
    } catch {
      return null;
    }
  }

  private async getOperationalSettingsOrNull() {
    try {
      const [liquidityPolicy, governancePolicy] = await Promise.all([
        this.operationalSettingsRepository.get("liquidity_policy"),
        this.operationalSettingsRepository.get("governance_policy")
      ]);

      return {
        liquidity_policy: liquidityPolicy?.value ?? null,
        governance_policy: governancePolicy?.value ?? null
      };
    } catch {
      return null;
    }
  }
}

function readJsonSetting(
  settings: Record<string, unknown> | null,
  key: string
) {
  if (!settings) return null;
  return settings[key] ?? null;
}

function getContractStatus(snapshot: {
  paused: boolean;
  strategiesPaused: boolean;
  emergencyShutdown: boolean;
}) {
  if (snapshot.emergencyShutdown) return "shutdown";
  if (snapshot.paused || snapshot.strategiesPaused) return "paused";
  return "healthy";
}

function formatSharePrice(value: bigint) {
  return `${formatDecimal(value, 6)} USDC por ovUSDC`;
}

function formatUsdc(value: bigint) {
  return `US$ ${formatDecimal(value, 6)}`;
}

function formatDecimal(value: bigint, decimals: number) {
  const scale = 10n ** BigInt(decimals);
  const whole = value / scale;
  const fraction = value % scale;
  const cents = (fraction / (scale / 100n)).toString().padStart(2, "0");

  return `${formatWhole(whole)},${cents}`;
}

function formatWhole(value: bigint) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
