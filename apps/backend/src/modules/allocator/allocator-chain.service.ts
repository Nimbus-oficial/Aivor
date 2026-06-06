import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { StructuredLogger } from "../../common/logging/structured-logger.service";
import { AuditLogService } from "../database/services/audit-log.service";

const selectors = {
  vaultIdleOnlyMode: "0x04f5b264",
  vaultMorphoAllocator: "0x43d0d136",
  asset: "0x38d52e0f",
  morpho: "0xd8fbc833",
  vault: "0xfbfa77cf",
  controller: "0xf77c4791",
  protocolEnabled: "0xf35fadb9",
  marketEnabled: "0x1ef261ba",
  totalAssets: "0x01e1d114",
  liquidAssets: "0xe492cdce",
  maxMarketExposure: "0xbde7c5c5",
  maxTotalExposure: "0x14a10511",
  marketId: "0x6ed71ede",
  isHealthy: "0xe4020804",
  marketDataUpdatedAt: "0x2967b1b4",
  maxMarketDataAge: "0x99c79893",
  utilizationBps: "0x975e900e",
  currentApyBps: "0x162517c8",
  riskScoreBps: "0xe8e922fa"
} as const;

const BASE_CHAIN_ID = 8453;
const BASE_USDC_ADDRESS = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";
const BASE_MORPHO_BLUE = "0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb";

@Injectable()
export class AllocatorChainService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: StructuredLogger,
    private readonly auditLogService: AuditLogService
  ) {}

  async getStatus() {
    const snapshot = await this.readSnapshot("allocator.configuration.read");
    if (!snapshot) return this.notConfigured();
    return snapshot;
  }

  async getExposure() {
    const snapshot = await this.readSnapshot("allocator.exposure.read");
    if (!snapshot) return this.notConfigured();
    return {
      allocatorAddress: snapshot.allocatorAddress,
      chainId: snapshot.chainId,
      totalAssets: snapshot.totalAssets,
      liquidAssets: snapshot.liquidAssets,
      exposureUsed: snapshot.exposureUsed,
      exposureLimit: snapshot.exposureLimit,
      exposureBps: snapshot.exposureBps,
      totalExposureLimit: snapshot.totalExposureLimit,
      marketId: snapshot.marketId,
      readOnly: true,
      noCapital: snapshot.totalAssets === "0",
      noSupply: snapshot.totalAssets === "0"
    };
  }

  async getHealth() {
    const snapshot = await this.readSnapshot("allocator.health.checked");
    if (!snapshot) {
      return {
        status: "not_configured",
        configured: false,
        chainId: null,
        allocatorAddress: null,
        contractExists: false,
        hasCode: null,
        readOnly: true
      };
    }

    const configOk =
      snapshot.contractExists &&
      snapshot.hasCode &&
      snapshot.assetAddress === this.getOptionalAddress("USDC_ADDRESS") &&
      snapshot.vaultAddress === this.getOptionalAddress("ORVEX_VAULT_ADDRESS") &&
      snapshot.controllerAddress === this.getOptionalAddress("ORVEX_CONTROLLER_ADDRESS");

    return {
      status: configOk ? "ok" : "degraded",
      configured: true,
      chainId: snapshot.chainId,
      allocatorAddress: snapshot.allocatorAddress,
      contractExists: snapshot.contractExists,
      hasCode: snapshot.hasCode,
      configurationOk: configOk,
      protocolEnabled: snapshot.protocolEnabled,
      marketEnabled: snapshot.marketEnabled,
      isHealthy: snapshot.isHealthy,
      stale: snapshot.stale,
      lastRiskUpdate: snapshot.lastRiskUpdate,
      readOnly: true,
      noCapital: snapshot.totalAssets === "0",
      noSupply: snapshot.totalAssets === "0"
    };
  }

  async getReadiness() {
    const snapshot = await this.readSnapshot("allocator.readiness.checked");
    if (!snapshot) {
      const readiness = {
        status: "BLOCKED" as const,
        productionStatus: "BLOCKED" as const,
        devValidationStatus: "BLOCKED" as const,
        mode: "activation_preparation" as const,
        generatedAt: new Date().toISOString(),
        allocatorAddress: null,
        checks: [
          {
            key: "configuration",
            label: "Allocator configuration",
            status: "BLOCKED" as const,
            reason: "MORPHO_ALLOCATOR_ADDRESS or ORVEX_RPC_URL is not configured.",
            source: "configuration" as const
          }
        ],
        activation: {
          protocolEnablePrepared: false,
          marketEnablePrepared: false,
          capitalMovementPrepared: false as const,
          realExecutionEnabled: false
        },
        production: {
          productionReadySafe: false,
          timelockConfigured: false,
          freshnessReady: false,
          readyForPublicLaunch: false as const
        },
        devValidation: {
          devSafeAccepted: false,
          policyMismatchExpected: false,
          readyForNextPreparation: false,
          readyForCapitalMovement: false as const,
          reason: "Allocator or RPC is not configured."
        },
        capitalValidation: this.getCapitalValidation("BLOCKED", "0", false, false),
        morphoPath: {
          status: "BLOCKED" as const,
          vaultConnectedToAllocator: false,
          allocatorConnectedToVault: false,
          allocatorConnectedToController: false,
          controllerCanOperateAllocator: false,
        operationalPathComplete: false,
        recommendedOption: "new_vault_and_controller" as const,
        diagnosis: "Allocator or RPC is not configured.",
        ...this.getV2PredeployReadiness(),
        sets: this.getMorphoValidationSets(null, null, null, false)
      },
        exposure: this.getPreparedExposure("0", "0"),
        custody: this.getReadinessCustody()
      };
      await this.recordReadinessAudit("allocator.activation.reviewed", null, readiness.status);
      await this.recordReadinessAudit("allocator.rollback.reviewed", null, readiness.status);
      return readiness;
    }

    const configOk =
      snapshot.contractExists &&
      snapshot.hasCode &&
      snapshot.chainId === BASE_CHAIN_ID &&
      snapshot.assetAddress === this.getOptionalAddress("USDC_ADDRESS") &&
      snapshot.vaultAddress === this.getOptionalAddress("ORVEX_VAULT_ADDRESS") &&
      snapshot.controllerAddress === this.getOptionalAddress("ORVEX_CONTROLLER_ADDRESS");
    const noCapital = snapshot.totalAssets === "0" && snapshot.liquidAssets === "0";
    const disabled = !snapshot.protocolEnabled && !snapshot.marketEnabled;
    const exposurePrepared =
      BigInt(snapshot.exposureLimit) > 0n &&
      BigInt(snapshot.totalExposureLimit) > 0n;
    const safeConfigured = Boolean(this.getOptionalAddress("SAFE_ADDRESS"));
    const timelockConfigured = Boolean(this.getOptionalAddress("TIMELOCK_ADDRESS"));
    const freshnessReady = !snapshot.stale;
    const devSafeAccepted =
      safeConfigured &&
      this.configService.get<string>("GOVERNANCE_MODE")?.trim() === "safe_readonly";
    const vaultPath = await this.readVaultPath(snapshot);

    const checks = [
      {
        key: "rpc",
        label: "RPC",
        status: snapshot.chainId === BASE_CHAIN_ID ? "READY" as const : "BLOCKED" as const,
        reason:
          snapshot.chainId === BASE_CHAIN_ID
            ? "Base Mainnet RPC is reachable with chainId 8453."
            : `Unexpected chainId ${snapshot.chainId}.`,
        source: "onchain" as const
      },
      {
        key: "vault",
        label: "Vault",
        status: snapshot.vaultAddress === this.getOptionalAddress("ORVEX_VAULT_ADDRESS") ? "READY" as const : "BLOCKED" as const,
        reason: "Vault address is read from allocator and compared with configuration.",
        source: "onchain" as const
      },
      {
        key: "controller",
        label: "Controller",
        status: snapshot.controllerAddress === this.getOptionalAddress("ORVEX_CONTROLLER_ADDRESS") ? "READY" as const : "BLOCKED" as const,
        reason: "Controller address is read from allocator and compared with configuration.",
        source: "onchain" as const
      },
      {
        key: "treasury",
        label: "Treasury",
        status: this.getOptionalAddress("ORVEX_TREASURY_ADDRESS") ? "READY" as const : "NOT_READY" as const,
        reason: this.getOptionalAddress("ORVEX_TREASURY_ADDRESS")
          ? "Treasury address is configured for monitoring."
          : "Treasury address is not configured in this backend process.",
        source: "configuration" as const
      },
      {
        key: "allocator",
        label: "Allocator",
        status: configOk ? "READY" as const : "BLOCKED" as const,
        reason: configOk
          ? "Allocator bytecode and critical addresses match configuration."
          : "Allocator configuration does not match expected addresses.",
        source: "onchain" as const
      },
      {
        key: "morpho",
        label: "Morpho",
        status: snapshot.morphoAddress === this.getOptionalAddress("MORPHO_BLUE_ADDRESS") ? "READY" as const : "BLOCKED" as const,
        reason: "Morpho Blue address is read from allocator and compared with configuration.",
        source: "onchain" as const
      },
      {
        key: "governance",
        label: "Governance",
        status: safeConfigured ? "READY" as const : "NOT_READY" as const,
        reason: safeConfigured
          ? "Safe address is configured for operational review."
          : "Safe address is not configured in this backend process.",
        source: "governance" as const
      },
      {
        key: "safe",
        label: "Safe",
        status: safeConfigured ? "READY" as const : "NOT_READY" as const,
        reason: devSafeAccepted
          ? "Dev Safe is accepted for private validation; production still requires Safe 2-of-4."
          : "Safe remains read-only; activation still requires a future governance step.",
        source: "governance" as const
      },
      {
        key: "timelock",
        label: "Timelock",
        status: timelockConfigured ? "READY" as const : "NOT_READY" as const,
        reason: timelockConfigured
          ? "Timelock address is configured."
          : "No external TimelockController address is configured; current controller has an internal simple timelock queue.",
        source: "governance" as const
      },
      {
        key: "auditoria",
        label: "Auditoria",
        status: "READY" as const,
        reason: "Readiness checks emit allocator readiness and review audit records.",
        source: "database" as const
      },
      {
        key: "painel",
        label: "Painel Admin",
        status: "READY" as const,
        reason: "Admin panel consumes allocator status and readiness in read-only mode.",
        source: "admin_panel" as const
      },
      {
        key: "runbooks",
        label: "Runbooks",
        status: "READY" as const,
        reason: "Activation and rollback runbooks are required before 10.9B.",
        source: "runbook" as const
      },
      {
        key: "freshness",
        label: "Freshness",
        status: freshnessReady ? "READY" as const : "NOT_READY" as const,
        reason: freshnessReady
          ? "Allocator market data is fresh."
          : "Allocator market data is stale; updateRiskData is required before any capital movement.",
        source: "onchain" as const
      },
      {
        key: "freshness_plan",
        label: "Freshness Plan",
        status: "READY" as const,
        reason: snapshot.stale
          ? "Freshness update flow is identified: Morpho data must be reviewed, then updateRiskData must be called by controller through an approved governance path."
          : "Allocator market data is fresh.",
        source: "onchain" as const
      },
      {
        key: "exposure",
        label: "Exposure Configuration",
        status: exposurePrepared ? "READY" as const : "NOT_READY" as const,
        reason: exposurePrepared
          ? "Exposure limits are present on-chain, but no activation has been executed."
          : "Exposure limits are zero or unavailable.",
        source: "onchain" as const
      },
      {
        key: "capital",
        label: "Capital Movement",
        status: noCapital && disabled ? "READY" as const : "BLOCKED" as const,
        reason: noCapital && disabled
          ? "No capital, no supply, protocol disabled and market disabled."
          : "Allocator has capital or active flags; this is outside 10.9A scope.",
        source: "onchain" as const
      }
    ];
    const productionStatus = checks.some((check) => check.status === "BLOCKED")
      ? "BLOCKED"
      : checks.some((check) => check.status === "NOT_READY")
        ? "NOT_READY"
        : "READY";
    const devBlockingKeys = new Set(["rpc", "vault", "controller", "allocator", "morpho", "capital"]);
    const devValidationStatus = checks.some(
      (check) => devBlockingKeys.has(check.key) && check.status === "BLOCKED"
    )
      ? "BLOCKED"
      : devSafeAccepted && noCapital && disabled
        ? "READY"
      : "NOT_READY";
    const recommendedInitialCapital = "1000000";
    const maxCapital = "10000000";
    const exposureCanCoverInitialCapital = BigInt(snapshot.exposureLimit) >= BigInt(recommendedInitialCapital);
    const rollbackReady = configOk && disabled && noCapital;
    const proposalPrepared = configOk && exposurePrepared && devSafeAccepted;
    const capitalValidationStatus =
      devValidationStatus !== "READY"
        ? devValidationStatus
        : rollbackReady && proposalPrepared && exposureCanCoverInitialCapital
          ? "READY"
          : "NOT_READY";

    const readiness = {
      status: devValidationStatus,
      productionStatus,
      devValidationStatus,
      mode: "activation_preparation" as const,
      generatedAt: new Date().toISOString(),
      allocatorAddress: snapshot.allocatorAddress,
      checks,
      production: {
        productionReadySafe: false,
        timelockConfigured,
        freshnessReady,
        readyForPublicLaunch: false as const
      },
      devValidation: {
        devSafeAccepted,
        policyMismatchExpected: devSafeAccepted,
        readyForNextPreparation: devValidationStatus === "READY",
        readyForCapitalMovement: false as const,
        reason:
          devValidationStatus === "READY"
            ? "Dev Safe is accepted for private validation and no capital is allocated; capital movement remains disabled until a new approval."
            : "Dev validation readiness still has blocking configuration issues."
      },
      capitalValidation: this.getCapitalValidation(
        capitalValidationStatus,
        snapshot.exposureLimit,
        rollbackReady,
        proposalPrepared
      ),
      morphoPath: vaultPath,
      activation: {
        protocolEnablePrepared: configOk && disabled,
        marketEnablePrepared: configOk && disabled && exposurePrepared,
        capitalMovementPrepared: false as const,
        realExecutionEnabled: false
      },
      exposure: this.getPreparedExposure(snapshot.exposureLimit, snapshot.totalExposureLimit),
      custody: this.getReadinessCustody()
    };

    await this.recordReadinessAudit("allocator.readiness.dev_reviewed", snapshot.allocatorAddress, devValidationStatus);
    await this.recordReadinessAudit("allocator.timelock.reviewed", snapshot.allocatorAddress, timelockConfigured ? "READY" : "NOT_READY");
    await this.recordReadinessAudit("allocator.freshness.reviewed", snapshot.allocatorAddress, freshnessReady ? "READY" : "NOT_READY");
    await this.recordReadinessAudit("allocator.safe_dev_mode.reviewed", snapshot.allocatorAddress, devSafeAccepted ? "READY" : "NOT_READY");
    await this.recordReadinessAudit("allocator.capital_validation.reviewed", snapshot.allocatorAddress, capitalValidationStatus);
    await this.recordReadinessAudit("allocator.capital_limits.reviewed", snapshot.allocatorAddress, exposureCanCoverInitialCapital ? "READY" : "NOT_READY");
    await this.recordReadinessAudit("allocator.rollback_validation.reviewed", snapshot.allocatorAddress, rollbackReady ? "READY" : "NOT_READY");
    await this.recordReadinessAudit("morpho.path.reviewed", snapshot.allocatorAddress, vaultPath.status);
    await this.recordReadinessAudit("morpho.architecture.reviewed", snapshot.allocatorAddress, vaultPath.status);
    await this.recordReadinessAudit("morpho.integration.reviewed", snapshot.allocatorAddress, vaultPath.status);
    await this.recordReadinessAudit(
      "allocator.activation.simulated",
      snapshot.allocatorAddress,
      vaultPath.activationSimulationPassed ? "READY" : "NOT_TESTED"
    );
    await this.recordReadinessAudit(
      "allocator.protocol.enable.simulated",
      snapshot.allocatorAddress,
      vaultPath.activationSimulationPassed ? "READY" : "NOT_TESTED"
    );
    await this.recordReadinessAudit(
      "allocator.market.enable.simulated",
      snapshot.allocatorAddress,
      vaultPath.activationSimulationPassed ? "READY" : "NOT_TESTED"
    );
    await this.recordReadinessAudit(
      "allocator.risk.update.simulated",
      snapshot.allocatorAddress,
      vaultPath.activationSimulationPassed ? "READY" : "NOT_TESTED"
    );
    await this.recordReadinessAudit(
      "allocator.emergency.simulated",
      snapshot.allocatorAddress,
      vaultPath.activationSimulationPassed ? "READY" : "NOT_TESTED"
    );
    await this.recordReadinessAudit("allocator.activation.reviewed", snapshot.allocatorAddress, devValidationStatus);
    await this.recordReadinessAudit("allocator.rollback.reviewed", snapshot.allocatorAddress, devValidationStatus);

    return readiness;
  }

  private async readSnapshot(auditAction: string) {
    const rpcUrl = this.getRpcUrl();
    const allocatorAddress = this.getOptionalAddress("MORPHO_ALLOCATOR_ADDRESS");
    if (!rpcUrl || !allocatorAddress) return null;

    const chainId = await this.readChainId(rpcUrl);
    const hasCode = await this.hasContractCode(rpcUrl, allocatorAddress);

    if (!hasCode) {
      return {
        allocatorAddress,
        chainId,
        contractExists: false,
        hasCode: false,
        status: "missing_code" as const,
        totalAssets: "0",
        liquidAssets: "0",
        exposureUsed: "0",
        exposureLimit: "0",
        totalExposureLimit: "0",
        exposureBps: 0,
        marketId: null,
        assetAddress: null,
        vaultAddress: null,
        controllerAddress: null,
        morphoAddress: null,
        protocolEnabled: false,
        marketEnabled: false,
        isHealthy: false,
        stale: true,
        lastRiskUpdate: null
      };
    }

    const assetAddress = await this.readAddress(rpcUrl, allocatorAddress, selectors.asset);
    const morphoAddress = await this.readAddress(rpcUrl, allocatorAddress, selectors.morpho);
    const vaultAddress = await this.readAddress(rpcUrl, allocatorAddress, selectors.vault);
    const controllerAddress = await this.readAddress(rpcUrl, allocatorAddress, selectors.controller);
    const protocolEnabled = await this.readBool(rpcUrl, allocatorAddress, selectors.protocolEnabled);
    const marketEnabled = await this.readBool(rpcUrl, allocatorAddress, selectors.marketEnabled);
    const totalAssets = await this.readUint(rpcUrl, allocatorAddress, selectors.totalAssets);
    const liquidAssets = await this.readUint(rpcUrl, allocatorAddress, selectors.liquidAssets);
    const maxMarketExposure = await this.readUint(rpcUrl, allocatorAddress, selectors.maxMarketExposure);
    const maxTotalExposure = await this.readUint(rpcUrl, allocatorAddress, selectors.maxTotalExposure);
    const marketId = await this.readBytes32(rpcUrl, allocatorAddress, selectors.marketId);
    const isHealthy = await this.readBool(rpcUrl, allocatorAddress, selectors.isHealthy);
    const marketDataUpdatedAt = await this.readUint(rpcUrl, allocatorAddress, selectors.marketDataUpdatedAt);
    const maxMarketDataAge = await this.readUint(rpcUrl, allocatorAddress, selectors.maxMarketDataAge);
    const utilizationBps = await this.readUint(rpcUrl, allocatorAddress, selectors.utilizationBps);
    const currentApyBps = await this.readUint(rpcUrl, allocatorAddress, selectors.currentApyBps);
    const riskScoreBps = await this.readUint(rpcUrl, allocatorAddress, selectors.riskScoreBps);

    const nowSeconds = BigInt(Math.floor(Date.now() / 1000));
    const stale = marketDataUpdatedAt === 0n || nowSeconds - marketDataUpdatedAt > maxMarketDataAge;
    const exposureBps = maxMarketExposure === 0n ? 0 : Number((totalAssets * 10_000n) / maxMarketExposure);
    const snapshot = {
      allocatorAddress,
      chainId,
      status: "read_only" as const,
      contractExists: true,
      hasCode: true,
      assetAddress,
      morphoAddress,
      vaultAddress,
      controllerAddress,
      protocolEnabled,
      marketEnabled,
      totalAssets: totalAssets.toString(),
      liquidAssets: liquidAssets.toString(),
      exposureUsed: totalAssets.toString(),
      exposureLimit: maxMarketExposure.toString(),
      totalExposureLimit: maxTotalExposure.toString(),
      exposureBps,
      marketId,
      isHealthy,
      stale,
      lastRiskUpdate: marketDataUpdatedAt === 0n ? null : new Date(Number(marketDataUpdatedAt) * 1000).toISOString(),
      maxMarketDataAgeSeconds: Number(maxMarketDataAge),
      utilizationBps: Number(utilizationBps),
      currentApyBps: Number(currentApyBps),
      riskScoreBps: Number(riskScoreBps),
      flags: {
        readOnly: true,
        noCapital: totalAssets === 0n,
        noSupply: totalAssets === 0n,
        backendCustodiesFunds: false
      }
    };

    await this.auditLogService.recordAuditAction({
      action: auditAction,
      origin: "backend-api",
      targetType: "morpho_allocator",
      targetId: allocatorAddress,
      result: "success",
      metadata: {
        chainId,
        protocolEnabled,
        marketEnabled,
        totalAssets: totalAssets.toString(),
        readOnly: true
      }
    }).catch(() => undefined);

    this.logger.info({
      event: auditAction,
      source: "backend-rpc",
      result: "success",
      metadata: {
        chainId,
        allocatorAddress,
        protocolEnabled,
        marketEnabled
      }
    });

    return snapshot;
  }

  private notConfigured() {
    return {
      status: "not_configured" as const,
      allocatorAddress: null,
      chainId: null,
      readOnly: true,
      flags: {
        readOnly: true,
        noCapital: true,
        noSupply: true,
        backendCustodiesFunds: false
      }
    };
  }

  private getPreparedExposure(maxMarketExposure: string, maxTotalExposure: string) {
    return {
      maxMarketExposure,
      maxTotalExposure,
      initialCapitalLimit: "0",
      idleLiquidityMinBps: 200,
      idleLiquidityTargetBps: 500,
      idleLiquidityMaxBps: 700
    };
  }

  private getCapitalValidation(
    status: "READY" | "NOT_READY" | "BLOCKED",
    exposureLimit: string,
    rollbackReady: boolean,
    proposalPrepared: boolean
  ) {
    return {
      status,
      proposedCapitalOptions: ["1000000", "5000000", "10000000"],
      recommendedInitialCapital: "1000000",
      maxCapital: "10000000",
      exposureLimit,
      rollbackReady,
      proposalPrepared,
      successCriteria: [
        "deposit succeeds",
        "allocation reaches Morpho",
        "totalAssets remains coherent",
        "withdraw returns USDC to validation wallet",
        "audit logs are persisted"
      ],
      failureCriteria: [
        "health check fails",
        "allocator becomes stale before action",
        "withdraw cannot restore liquidity",
        "accounting diverges",
        "unexpected capital remains allocated"
      ],
      readyForFirstUsdc: false as const
    };
  }

  private async readVaultPath(snapshot: {
    allocatorAddress: string;
    vaultAddress: string | null;
    controllerAddress: string | null;
  }) {
    const rpcUrl = this.getRpcUrl();
    const configuredVault = this.getOptionalAddress("ORVEX_VAULT_ADDRESS");
    const configuredController = this.getOptionalAddress("ORVEX_CONTROLLER_ADDRESS");
    if (!rpcUrl || !configuredVault) {
      return {
        status: "BLOCKED" as const,
        vaultConnectedToAllocator: false,
        allocatorConnectedToVault: snapshot.vaultAddress === configuredVault,
        allocatorConnectedToController: snapshot.controllerAddress === configuredController,
        controllerCanOperateAllocator: false,
        operationalPathComplete: false,
        recommendedOption: "new_vault_and_controller" as const,
        diagnosis: "Vault or RPC is not configured.",
        ...this.getV2PredeployReadiness(),
        sets: this.getMorphoValidationSets(configuredVault, configuredController, snapshot.allocatorAddress, false)
      };
    }

    const vaultIdleOnlyMode = await this.readBool(rpcUrl, configuredVault, selectors.vaultIdleOnlyMode);
    const vaultAllocator = await this.readAddress(rpcUrl, configuredVault, selectors.vaultMorphoAllocator);
    const expectedAllocator = normalizeAddress(snapshot.allocatorAddress);
    const vaultConnectedToAllocator = vaultAllocator === expectedAllocator && !vaultIdleOnlyMode;
    const allocatorConnectedToVault = snapshot.vaultAddress === configuredVault;
    const allocatorConnectedToController = snapshot.controllerAddress === configuredController;
    const controllerCanOperateAllocator = false;
    const operationalPathComplete =
      vaultConnectedToAllocator &&
      allocatorConnectedToVault &&
      allocatorConnectedToController &&
      controllerCanOperateAllocator;

    return {
      status: operationalPathComplete ? "READY" as const : "BLOCKED" as const,
      vaultConnectedToAllocator,
      allocatorConnectedToVault,
      allocatorConnectedToController,
      controllerCanOperateAllocator,
      operationalPathComplete,
      recommendedOption: "new_vault_and_controller" as const,
      diagnosis: vaultIdleOnlyMode
        ? "Current Vault is idle-only and immutable; it cannot route funds to MorphoAllocator."
        : "Current Controller lacks governed allocator operation functions.",
      ...this.getV2PredeployReadiness(),
      sets: this.getMorphoValidationSets(configuredVault, configuredController, snapshot.allocatorAddress, operationalPathComplete)
    };
  }

  private getV2PredeployReadiness() {
    const usdc = this.getOptionalAddress("USDC_ADDRESS");
    const morphoBlue = this.getOptionalAddress("MORPHO_BLUE_ADDRESS");
    const safe = this.getOptionalAddress("SAFE_ADDRESS");
    const treasuryWallet = this.getOptionalAddress("TREASURY_WALLET");
    const validationWallet = this.getOptionalAddress("VALIDATION_WALLET");
    const marketId = this.configService.get<string>("MORPHO_MARKET_ID")?.trim();
    const validationCap = this.configService.get<string>("VALIDATION_DEPOSIT_CAP")?.trim();
    const maxMarketDataAge = this.configService.get<string>("MORPHO_ALLOCATOR_MAX_MARKET_DATA_AGE")?.trim();
    const v2DeployReady = Boolean(
      usdc === BASE_USDC_ADDRESS &&
      morphoBlue === BASE_MORPHO_BLUE &&
      safe &&
      treasuryWallet &&
      validationWallet &&
      marketId &&
      validationCap === "1000000" &&
      maxMarketDataAge &&
      Number(maxMarketDataAge) > 0
    );

    return {
      v2DeployReady,
      v2NonceSafe: false,
      v2DryRunPassed: false,
      v2NoCapitalMovement: true,
      v2ReadyForBroadcast: false,
      activationSimulationPassed:
        this.configService.get<string>("AIVOR_V2_ACTIVATION_SIMULATION_PASSED")?.trim().toLowerCase() === "true"
    };
  }

  private getMorphoValidationSets(
    v1VaultAddress: string | null,
    v1ControllerAddress: string | null,
    v1AllocatorAddress: string | null,
    v1PathComplete: boolean
  ) {
    const v2VaultAddress = this.getOptionalAddress("AIVOR_V2_VAULT_ADDRESS");
    const v2ControllerAddress = this.getOptionalAddress("AIVOR_V2_CONTROLLER_ADDRESS");
    const v2AllocatorAddress = this.getOptionalAddress("AIVOR_V2_ALLOCATOR_ADDRESS");
    const v2Configured = Boolean(v2VaultAddress && v2ControllerAddress && v2AllocatorAddress);

    return [
      {
        name: "V1 idle-only set",
        status: v1PathComplete ? "READY" as const : "BLOCKED" as const,
        vaultAddress: v1VaultAddress,
        controllerAddress: v1ControllerAddress,
        allocatorAddress: v1AllocatorAddress,
        pathComplete: v1PathComplete,
        note: v1PathComplete
          ? "Legacy set reports a complete path."
          : "Legacy private validation set is idle-only and cannot complete the Morpho capital path."
      },
      {
        name: "V2 morpho-controlled set",
        status: v2Configured ? "NOT_READY" as const : "NOT_READY" as const,
        vaultAddress: v2VaultAddress,
        controllerAddress: v2ControllerAddress,
        allocatorAddress: v2AllocatorAddress,
        pathComplete: false,
        note: v2Configured
          ? "V2 addresses are configured, but read-only on-chain validation has not been executed yet."
          : "V2 contracts are prepared in code and still require private deployment plus read-only validation."
      }
    ];
  }

  private getReadinessCustody() {
    return {
      backendCustodiesFunds: false as const,
      noSupplyExecuted: true as const,
      noWithdrawExecuted: true as const,
      finalFinancialSource: "blockchain" as const
    };
  }

  private async recordReadinessAudit(action: string, allocatorAddress: string | null, status: string) {
    await this.auditLogService.recordAuditAction({
      action,
      origin: "backend-api",
      targetType: "morpho_allocator",
      targetId: allocatorAddress,
      result: "success",
      metadata: {
        status,
        readOnly: true,
        capitalMovementPrepared: false,
        realExecutionEnabled: false
      }
    }).catch(() => undefined);
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

  private async readUint(rpcUrl: string, to: string, data: string) {
    return BigInt(await this.ethCall(rpcUrl, to, data));
  }

  private async readBool(rpcUrl: string, to: string, data: string) {
    return (await this.readUint(rpcUrl, to, data)) === 1n;
  }

  private async readAddress(rpcUrl: string, to: string, data: string) {
    const result = await this.ethCall(rpcUrl, to, data);
    return normalizeAddress(`0x${result.slice(-40)}`);
  }

  private async readBytes32(rpcUrl: string, to: string, data: string) {
    return this.ethCall(rpcUrl, to, data);
  }

  private async ethCall(rpcUrl: string, to: string, data: string) {
    return this.rpcRequest(rpcUrl, "eth_call", [{ to, data }, "latest"]);
  }

  private async rpcRequest(rpcUrl: string, method: string, params: unknown[]) {
    let response: Response | null = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      response = await fetch(rpcUrl, {
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

      if (response.ok || response.status !== 429) break;
      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }

    if (!response?.ok) throw new Error(`RPC_HTTP_${response?.status ?? "UNKNOWN"}`);

    const payload = (await response.json()) as {
      error?: { message?: string };
      result?: string;
    };

    if (payload.error || !payload.result) {
      throw new Error(payload.error?.message ?? "RPC_EMPTY_RESULT");
    }

    return payload.result;
  }
}

function normalizeAddress(address: string) {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error("INVALID_ADDRESS");
  }

  return address.toLowerCase();
}
