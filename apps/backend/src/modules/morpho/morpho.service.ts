import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuditLogService } from "../database/services/audit-log.service";
import {
  MorphoMarketApprovalRepository,
  type MorphoMarketApprovalRow,
  type MorphoMarketApprovalStatus
} from "../database/repositories/morpho-market-approval.repository";
import { MorphoRiskSnapshotRepository } from "../database/repositories/morpho-risk-snapshot.repository";
import {
  classifyMorphoMarket,
  type MorphoEligibilityCriteria,
  type MorphoMarketCandidate
} from "./morpho-market-selection";
import type { MorphoMarketActionDto, MorphoSimulationActionDto } from "./dto/morpho.dto";

const USDC = "USDC";
const SHARE_PRICE_SCALE = 1_000_000n;

@Injectable()
export class MorphoService {
  private simulationState: MorphoSimulationState = {
    status: "idle",
    totalSupply: 0n,
    idleAssets: 0n,
    positions: new Map(),
    recentEvents: [],
    lastUpdatedAt: null
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly marketApprovalRepository: MorphoMarketApprovalRepository,
    private readonly riskSnapshotRepository: MorphoRiskSnapshotRepository,
    private readonly auditLogService: AuditLogService
  ) {}

  private readonly criteria: MorphoEligibilityCriteria = {
    allowedLoanAssets: [USDC],
    minLiquidityAssets: 100_000_000_000n,
    minSupplyApyBps: 50,
    maxSupplyApyBps: 1_500,
    maxUtilizationBps: 9_000,
    maxLltvBps: 8600,
    maxRiskScoreBps: 2_500,
    requiresTrustedOracle: true,
    requiresGovernanceApproval: true
  };

  getMarketsOverview() {
    return this.buildOverview(this.getConfiguredMarkets(), "fallback", null, false);
  }

  async getMarketsOverviewReadOnly() {
    if (this.getDataMode() !== "real") {
      return this.buildOverview(this.getConfiguredMarkets(), "fallback", null, false);
    }

    try {
      const markets = await this.fetchRealMarkets();
      const checkedAt = new Date().toISOString();
      return this.buildOverview(markets, "real", checkedAt, this.isStale(checkedAt));
    } catch {
      return this.buildOverview(this.getConfiguredMarkets(), "fallback", null, false);
    }
  }

  async getMarketDetail(marketId: string) {
    const overview = await this.getMarketsOverviewReadOnly();
    const market = overview.markets.find((candidate) => candidate.marketId === marketId);
    return {
      market: market ?? null,
      approval: await this.findApprovalOrNull(marketId),
      riskHistory: await this.listRiskHistoryOrEmpty(marketId)
    };
  }

  async getRiskHistory(marketId: string) {
    return this.listRiskHistoryOrEmpty(marketId, 50);
  }

  async getSimulationOverview() {
    const overview = await this.getMarketsOverviewReadOnly();
    return this.buildSimulationOverview(Boolean(overview.stale));
  }

  async startSimulation(input: MorphoSimulationActionDto, actorUserId: string) {
    this.simulationState = {
      status: "running",
      totalSupply: 0n,
      idleAssets: 0n,
      positions: new Map(),
      recentEvents: [],
      lastUpdatedAt: new Date().toISOString()
    };

    await this.recordSimulationAudit("morpho.simulation.started", actorUserId, "success", {
      amountAssets: input.amountAssets,
      marketId: input.marketId,
      toMarketId: input.toMarketId,
      reason: input.reason,
      metadata: input.metadata
    });
    return this.getSimulationOverview();
  }

  async simulateDeposit(input: MorphoSimulationActionDto, actorUserId: string) {
    const assets = parseSimulationAmount(input.amountAssets);
    if (assets <= 0n) {
      return this.failSimulation("deposit", input, actorUserId, "amountAssets must be positive");
    }

    const totalAssetsBefore = this.getSimulationTotalAssets();
    const shares =
      this.simulationState.totalSupply === 0n || totalAssetsBefore === 0n
        ? assets
        : (assets * this.simulationState.totalSupply) / totalAssetsBefore;
    if (shares <= 0n) {
      return this.failSimulation("deposit", input, actorUserId, "deposit would mint zero simulated shares");
    }

    this.simulationState.idleAssets += assets;
    this.simulationState.totalSupply += shares;
    this.completeSimulationStep("deposit", assets, input.marketId ?? null);
    await this.recordSimulationAudit("morpho.simulation.completed", actorUserId, "success", {
      ...input,
      operation: "deposit",
      shares: shares.toString()
    });
    return this.getSimulationOverview();
  }

  async simulateAllocation(input: MorphoSimulationActionDto, actorUserId: string) {
    const assets = parseSimulationAmount(input.amountAssets);
    if (assets <= 0n) {
      return this.failSimulation("allocation", input, actorUserId, "amountAssets must be positive");
    }
    const market = await this.findSimulationMarket(input.marketId);
    if (!market) return this.failSimulation("allocation", input, actorUserId, "eligible market is required");
    const gate = await this.validateSimulationGate(market.marketId, assets);
    if (!gate.ok) return this.failSimulation("allocation", input, actorUserId, gate.reason);
    if (assets > this.simulationState.idleAssets) {
      return this.failSimulation("allocation", input, actorUserId, "insufficient idle liquidity");
    }

    const position = this.getSimulationPosition(market.marketId, market.status);
    position.allocatedAssets += assets;
    position.status = market.status;
    this.simulationState.idleAssets -= assets;
    this.simulationState.positions.set(market.marketId, position);
    this.completeSimulationStep("allocation", assets, market.marketId);
    await this.recordSimulationAudit("morpho.simulated_allocation", actorUserId, "success", {
      amountAssets: input.amountAssets,
      marketId: input.marketId,
      reason: input.reason,
      metadata: input.metadata
    });
    return this.getSimulationOverview();
  }

  async simulateYield(input: MorphoSimulationActionDto, actorUserId: string) {
    const assets = parseSimulationAmount(input.amountAssets);
    if (assets <= 0n) {
      return this.failSimulation("yield", input, actorUserId, "amountAssets must be positive");
    }
    const market = await this.findSimulationMarket(input.marketId);
    if (!market) return this.failSimulation("yield", input, actorUserId, "eligible market is required");
    const gate = await this.validateSimulationGate(market.marketId, 0n);
    if (!gate.ok) return this.failSimulation("yield", input, actorUserId, gate.reason);

    const position = this.getSimulationPosition(market.marketId, market.status);
    if (position.allocatedAssets <= 0n) {
      return this.failSimulation("yield", input, actorUserId, "market has no simulated allocation");
    }
    position.simulatedYieldAssets += assets;
    position.allocatedAssets += assets;
    position.status = market.status;
    this.simulationState.positions.set(market.marketId, position);
    this.completeSimulationStep("yield", assets, market.marketId);
    await this.recordSimulationAudit("morpho.simulation.completed", actorUserId, "success", {
      ...input,
      operation: "yield"
    });
    return this.getSimulationOverview();
  }

  async simulateLoss(input: MorphoSimulationActionDto, actorUserId: string) {
    const assets = parseSimulationAmount(input.amountAssets);
    if (assets <= 0n) {
      return this.failSimulation("loss", input, actorUserId, "amountAssets must be positive");
    }
    const market = await this.findSimulationMarket(input.marketId);
    if (!market) return this.failSimulation("loss", input, actorUserId, "eligible market is required");
    const position = this.getSimulationPosition(market.marketId, market.status);
    if (assets > position.allocatedAssets) {
      return this.failSimulation("loss", input, actorUserId, "loss exceeds simulated market allocation");
    }

    position.simulatedLossAssets += assets;
    position.allocatedAssets -= assets;
    position.status = market.status;
    this.simulationState.positions.set(market.marketId, position);
    this.completeSimulationStep("loss", assets, market.marketId);
    await this.recordSimulationAudit("morpho.simulation.completed", actorUserId, "success", {
      ...input,
      operation: "loss"
    });
    return this.getSimulationOverview();
  }

  async simulateRebalance(input: MorphoSimulationActionDto, actorUserId: string) {
    const assets = parseSimulationAmount(input.amountAssets);
    if (assets <= 0n) {
      return this.failSimulation("rebalance", input, actorUserId, "amountAssets must be positive");
    }
    const fromMarket = await this.findSimulationMarket(input.marketId);
    const toMarket = await this.findSimulationMarket(input.toMarketId);
    if (!fromMarket || !toMarket) {
      return this.failSimulation("rebalance", input, actorUserId, "source and target markets are required");
    }
    const gate = await this.validateSimulationGate(toMarket.marketId, assets);
    if (!gate.ok) return this.failSimulation("rebalance", input, actorUserId, gate.reason);

    const fromPosition = this.getSimulationPosition(fromMarket.marketId, fromMarket.status);
    if (assets > fromPosition.allocatedAssets) {
      return this.failSimulation("rebalance", input, actorUserId, "rebalance exceeds source allocation");
    }
    const toPosition = this.getSimulationPosition(toMarket.marketId, toMarket.status);
    fromPosition.allocatedAssets -= assets;
    toPosition.allocatedAssets += assets;
    this.simulationState.positions.set(fromMarket.marketId, fromPosition);
    this.simulationState.positions.set(toMarket.marketId, toPosition);
    this.completeSimulationStep("rebalance", assets, `${fromMarket.marketId}->${toMarket.marketId}`);
    await this.recordSimulationAudit("morpho.simulated_rebalance", actorUserId, "success", {
      amountAssets: input.amountAssets,
      marketId: input.marketId,
      toMarketId: input.toMarketId,
      reason: input.reason,
      metadata: input.metadata
    });
    return this.getSimulationOverview();
  }

  async simulateWithdraw(input: MorphoSimulationActionDto, actorUserId: string) {
    const assets = parseSimulationAmount(input.amountAssets);
    if (assets <= 0n) {
      return this.failSimulation("withdraw", input, actorUserId, "amountAssets must be positive");
    }
    const totalAssets = this.getSimulationTotalAssets();
    if (assets > totalAssets) {
      return this.failSimulation("withdraw", input, actorUserId, "withdraw exceeds simulated total assets");
    }

    let remaining = assets;
    const idleUsed = minBigInt(this.simulationState.idleAssets, remaining);
    this.simulationState.idleAssets -= idleUsed;
    remaining -= idleUsed;

    for (const [marketId, position] of this.simulationState.positions) {
      if (remaining === 0n) break;
      const pulled = minBigInt(position.allocatedAssets, remaining);
      position.allocatedAssets -= pulled;
      remaining -= pulled;
      this.simulationState.positions.set(marketId, position);
    }

    if (remaining > 0n) {
      return this.failSimulation("withdraw", input, actorUserId, "insufficient simulated liquidity");
    }

    const sharesToBurn = totalAssets === 0n ? 0n : (assets * this.simulationState.totalSupply) / totalAssets;
    this.simulationState.totalSupply =
      sharesToBurn > this.simulationState.totalSupply ? 0n : this.simulationState.totalSupply - sharesToBurn;
    this.completeSimulationStep("withdraw", assets, input.marketId ?? null);
    await this.recordSimulationAudit("morpho.simulation.completed", actorUserId, "success", {
      ...input,
      operation: "withdraw",
      sharesBurned: sharesToBurn.toString()
    });
    return this.getSimulationOverview();
  }

  async setMarketStatus(
    marketId: string,
    status: MorphoMarketApprovalStatus,
    input: MorphoMarketActionDto,
    actorUserId: string
  ) {
    const reason = input.reason ?? `market marked as ${status}`;
    const approval = await this.marketApprovalRepository.upsert({
      marketId,
      status,
      reason,
      updatedBy: actorUserId,
      metadata: input.metadata ?? {}
    });

    await this.auditLogService.recordAuditAction({
      actorUserId,
      action: `morpho.market.${status === "eligible" ? "approved" : status}`,
      origin: "backend-api",
      targetType: "morpho_market",
      targetId: marketId,
      result: "success",
      metadata: {
        status,
        reason,
        readOnly: true
      }
    });

    return approval;
  }

  async getHealth() {
    const configured = this.getDataMode() === "real";
    if (!configured) {
      return {
        status: "fallback",
        configured: false,
        source: "fallback",
        network: this.getNetwork(),
        chainId: this.getChainId(),
        endpoint: null,
        marketsAvailable: this.getConfiguredMarkets().length,
        fallbackActive: true
      };
    }

    try {
      const markets = await this.fetchRealMarkets();
      const checkedAt = new Date().toISOString();
      const stale = this.isStale(checkedAt);
      if (stale) {
        await this.auditLogService.recordAuditAction({
          action: "morpho.market.stale_detected",
          origin: "backend-api",
          targetType: "morpho_market_data",
          result: "failure",
          metadata: {
            checkedAt,
            maxAgeSeconds: this.getMaxAgeSeconds()
          }
        }).catch(() => undefined);
      }

      return {
        status: stale ? "stale" : markets.length > 0 ? "ok" : "degraded",
        configured: true,
        source: "real",
        network: this.getNetwork(),
        chainId: this.getChainId(),
        endpoint: this.getApiUrl(),
        marketsAvailable: markets.length,
        fallbackActive: false,
        lastUpdatedAt: checkedAt,
        maxAgeSeconds: this.getMaxAgeSeconds(),
        stale
      };
    } catch (error) {
      return {
        status: "degraded",
        configured: true,
        source: "fallback",
        network: this.getNetwork(),
        chainId: this.getChainId(),
        endpoint: this.getApiUrl(),
        marketsAvailable: this.getConfiguredMarkets().length,
        fallbackActive: true,
        error: error instanceof Error ? error.message : "unknown Morpho API error"
      };
    }
  }

  private buildOverview(
    candidates: MorphoMarketCandidate[],
    dataSource: "real" | "fallback",
    lastUpdatedAt: string | null,
    stale: boolean
  ) {
    const markets = candidates.map((market) => {
      const classification = classifyMorphoMarket(market, this.criteria);
      const status = market.approvalStatus ?? classification.status;
      const statusReason = market.approvalStatus
        ? market.approvalReason ?? `market status set to ${market.approvalStatus}`
        : classification.statusReason;

      return {
        marketId: market.marketId,
        loanToken: market.loanToken,
        collateralToken: market.collateralToken,
        oracle: market.oracle,
        irm: market.irm,
        lltvBps: market.lltvBps,
        totalSupplyAssets: market.totalSupplyAssets.toString(),
        totalBorrowAssets: market.totalBorrowAssets.toString(),
        utilizationBps: classification.utilizationBps,
        supplyApyBps: market.supplyApyBps,
        liquidityAssets: market.liquidityAssets.toString(),
        riskScoreBps: classification.riskScoreBps,
        status,
        statusReason,
        approval: market.approvalStatus
          ? {
              status: market.approvalStatus,
              reason: market.approvalReason ?? "",
              updatedAt: market.approvalUpdatedAt ?? ""
            }
          : null,
        riskIndicators: {
          oracleTrusted: market.oracleTrusted,
          governanceApproved: market.governanceApproved,
          hasCriticalFlags: (market.criticalFlags?.length ?? 0) > 0,
          criticalFlags: market.criticalFlags ?? []
        },
        mode: "read_only" as const
      };
    });

    void this.recordRiskSnapshots(markets, dataSource).catch(() => undefined);

    return {
      mode: "read_only" as const,
      dataSource,
      lastUpdatedAt,
      maxAgeSeconds: this.getMaxAgeSeconds(),
      stale,
      criteria: {
        ...this.criteria,
        minLiquidityAssets: this.criteria.minLiquidityAssets.toString()
      },
      markets,
      custody: {
        backendCustodiesFunds: false as const,
        readOnly: true as const,
        noSupplyExecuted: true as const,
        finalFinancialSource: "blockchain"
      }
    };
  }

  private async fetchRealMarkets(): Promise<MorphoMarketCandidate[]> {
    const response = await fetch(this.getApiUrl(), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json"
      },
      body: JSON.stringify({
        query: MORPHO_MARKETS_QUERY,
        variables: {
          chainId: this.getChainId(),
          first: this.getFirst()
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Morpho API returned ${response.status}`);
    }

    const payload = (await response.json()) as MorphoGraphQlResponse;
    if (payload.errors?.length) {
      throw new Error(payload.errors.map((error) => error.message).join("; "));
    }

    const approvals = await this.listApprovalsOrEmpty();
    const approvalByMarket = new Map(approvals.map((approval) => [approval.market_id, approval]));

    return (payload.data?.markets?.items ?? [])
      .filter((market) => market.loanAsset?.symbol === USDC)
      .map((market) => this.normalizeMarket(market, approvalByMarket.get(market.marketId)));
  }

  private normalizeMarket(
    market: MorphoApiMarket,
    approval?: MorphoMarketApprovalRow | null
  ): MorphoMarketCandidate {
    const supplyAssets = parseAssetAmount(market.state?.supplyAssets);
    const borrowAssets = parseAssetAmount(market.state?.borrowAssets);
    const liquidityAssets =
      parseAssetAmount(market.state?.liquidityAssets) ||
      (supplyAssets > borrowAssets ? supplyAssets - borrowAssets : 0n);
    const warnings = market.warnings ?? [];

    return {
      marketId: market.marketId,
      loanToken: market.loanAsset?.symbol ?? "UNKNOWN",
      collateralToken: market.collateralAsset?.symbol ?? "UNKNOWN",
      oracle: market.oracle?.address ?? "unknown",
      irm: market.irmAddress ?? "unknown",
      lltvBps: decimalToBps(market.lltv),
      totalSupplyAssets: supplyAssets,
      totalBorrowAssets: borrowAssets,
      supplyApyBps: decimalToBps(market.state?.supplyApy),
      liquidityAssets,
      oracleTrusted: Boolean(market.oracle?.address),
      governanceApproved: approval?.status === "eligible",
      approvalStatus: approval?.status,
      approvalReason: approval?.reason,
      approvalUpdatedAt: approval?.updated_at?.toISOString(),
      criticalFlags: warnings
        .filter((warning) => warning.level?.toLowerCase() === "critical")
        .map((warning) => warning.type)
    };
  }

  private getDataMode() {
    return this.configService.get<string>("MORPHO_DATA_MODE") === "real" ? "real" : "fallback";
  }

  private getApiUrl() {
    return this.configService.get<string>("MORPHO_API_URL") ?? "https://api.morpho.org/graphql";
  }

  private getChainId() {
    return Number(this.configService.get<string>("MORPHO_CHAIN_ID") ?? "8453");
  }

  private getNetwork() {
    return this.configService.get<string>("MORPHO_NETWORK") ?? "base";
  }

  private getFirst() {
    return Number(this.configService.get<string>("MORPHO_MARKETS_FIRST") ?? "25");
  }

  private getMaxAgeSeconds() {
    return Number(this.configService.get<string>("MORPHO_MAX_AGE_SECONDS") ?? "300");
  }

  private isStale(timestamp: string | null) {
    if (!timestamp) return true;
    const maxAgeSeconds = this.getMaxAgeSeconds();
    if (maxAgeSeconds <= 0) return true;
    return Date.now() - new Date(timestamp).getTime() > maxAgeSeconds * 1000;
  }

  private async recordRiskSnapshots(
    markets: Array<{
      marketId: string;
      supplyApyBps: number;
      liquidityAssets: string;
      utilizationBps: number;
      lltvBps: number;
      riskScoreBps: number;
      status: MorphoMarketApprovalStatus;
    }>,
    dataSource: "real" | "fallback"
  ) {
    await Promise.all(
      markets.map(async (market) => {
        await this.riskSnapshotRepository.create({
          marketId: market.marketId,
          supplyApyBps: market.supplyApyBps,
          liquidityAssets: market.liquidityAssets,
          utilizationBps: market.utilizationBps,
          lltvBps: market.lltvBps,
          riskScoreBps: market.riskScoreBps,
          status: market.status,
          dataSource,
          metadata: {
            readOnly: true
          }
        });
      })
    );

    await this.auditLogService.recordAuditAction({
      action: "morpho.market.snapshot_created",
      origin: "backend-api",
      targetType: "morpho_market_risk_snapshots",
      result: "success",
      metadata: {
        count: markets.length,
        dataSource
      }
    });
  }

  private async listApprovalsOrEmpty() {
    try {
      return await this.marketApprovalRepository.list();
    } catch {
      return [];
    }
  }

  private async findApprovalOrNull(marketId: string) {
    try {
      return await this.marketApprovalRepository.findByMarketId(marketId);
    } catch {
      return null;
    }
  }

  private async listRiskHistoryOrEmpty(marketId: string, limit = 10) {
    try {
      return await this.riskSnapshotRepository.listByMarketId(marketId, limit);
    } catch {
      return [];
    }
  }

  private buildSimulationOverview(stale: boolean) {
    const allocatedAssets = Array.from(this.simulationState.positions.values()).reduce(
      (sum, position) => sum + position.allocatedAssets,
      0n
    );
    const simulatedYieldAssets = Array.from(this.simulationState.positions.values()).reduce(
      (sum, position) => sum + position.simulatedYieldAssets,
      0n
    );
    const simulatedLossAssets = Array.from(this.simulationState.positions.values()).reduce(
      (sum, position) => sum + position.simulatedLossAssets,
      0n
    );
    const totalAssets = this.simulationState.idleAssets + allocatedAssets;
    const sharePrice =
      this.simulationState.totalSupply === 0n
        ? SHARE_PRICE_SCALE
        : (totalAssets * SHARE_PRICE_SCALE) / this.simulationState.totalSupply;

    return {
      mode: "simulated" as const,
      status: this.simulationState.status,
      totalAssets: totalAssets.toString(),
      totalSupply: this.simulationState.totalSupply.toString(),
      sharePrice: sharePrice.toString(),
      idleAssets: this.simulationState.idleAssets.toString(),
      allocatedAssets: allocatedAssets.toString(),
      simulatedYieldAssets: simulatedYieldAssets.toString(),
      simulatedLossAssets: simulatedLossAssets.toString(),
      exposureBps: totalAssets === 0n ? 0 : Number((allocatedAssets * 10_000n) / totalAssets),
      maxExposureBps: this.getSimulationMaxExposureBps(),
      stale,
      lastUpdatedAt: this.simulationState.lastUpdatedAt,
      positions: Array.from(this.simulationState.positions.entries()).map(([marketId, position]) => ({
        marketId,
        allocatedAssets: position.allocatedAssets.toString(),
        simulatedYieldAssets: position.simulatedYieldAssets.toString(),
        simulatedLossAssets: position.simulatedLossAssets.toString(),
        status: position.status
      })),
      recentEvents: this.simulationState.recentEvents.slice(0, 20),
      custody: {
        backendCustodiesFunds: false as const,
        simulatedOnly: true as const,
        noSupplyExecuted: true as const,
        finalFinancialSource: "blockchain"
      }
    };
  }

  private async findSimulationMarket(marketId: string | undefined) {
    if (!marketId) return null;
    const overview = await this.getMarketsOverviewReadOnly();
    const market = overview.markets.find((candidate) => candidate.marketId === marketId);
    return market ?? null;
  }

  private async validateSimulationGate(marketId: string, newExposureAssets: bigint) {
    const overview = await this.getMarketsOverviewReadOnly();
    if (overview.stale) return { ok: false, reason: "morpho data is stale" };
    const market = overview.markets.find((candidate) => candidate.marketId === marketId);
    if (!market) return { ok: false, reason: "market not found" };
    if (market.status !== "eligible") {
      return { ok: false, reason: `market is ${market.status}` };
    }
    if (market.riskIndicators.hasCriticalFlags) {
      return { ok: false, reason: "market has critical risk flags" };
    }

    const totalAssets = this.getSimulationTotalAssets();
    const allocatedAssets = this.getSimulationAllocatedAssets() + newExposureAssets;
    const exposureBps = totalAssets === 0n ? 0 : Number((allocatedAssets * 10_000n) / totalAssets);
    if (exposureBps > this.getSimulationMaxExposureBps()) {
      return { ok: false, reason: "simulated exposure limit exceeded" };
    }
    return { ok: true, reason: "ok" };
  }

  private getSimulationPosition(marketId: string, status: MorphoMarketApprovalStatus): SimulationPosition {
    return (
      this.simulationState.positions.get(marketId) ?? {
        allocatedAssets: 0n,
        simulatedYieldAssets: 0n,
        simulatedLossAssets: 0n,
        status
      }
    );
  }

  private getSimulationTotalAssets() {
    return this.simulationState.idleAssets + this.getSimulationAllocatedAssets();
  }

  private getSimulationAllocatedAssets() {
    return Array.from(this.simulationState.positions.values()).reduce(
      (sum, position) => sum + position.allocatedAssets,
      0n
    );
  }

  private getSimulationMaxExposureBps() {
    return Number(this.configService.get<string>("MORPHO_SIM_MAX_EXPOSURE_BPS") ?? "7000");
  }

  private completeSimulationStep(
    operation: SimulationEvent["operation"],
    amountAssets: bigint,
    marketId: string | null
  ) {
    this.simulationState.status = "completed";
    this.simulationState.lastUpdatedAt = new Date().toISOString();
    this.simulationState.recentEvents.unshift({
      operation,
      marketId,
      amountAssets: amountAssets.toString(),
      result: "success",
      createdAt: this.simulationState.lastUpdatedAt
    });
  }

  private async failSimulation(
    operation: SimulationEvent["operation"],
    input: MorphoSimulationActionDto,
    actorUserId: string,
    reason: string
  ) {
    const createdAt = new Date().toISOString();
    this.simulationState.status = "failed";
    this.simulationState.lastUpdatedAt = createdAt;
    this.simulationState.recentEvents.unshift({
      operation,
      marketId: input.marketId ?? null,
      amountAssets: input.amountAssets ?? "0",
      result: "failure",
      reason,
      createdAt
    });
    await this.recordSimulationAudit("morpho.simulation.failed", actorUserId, "failure", {
      ...input,
      operation,
      reason
    });
    return this.buildSimulationOverview(false);
  }

  private async recordSimulationAudit(
    action: string,
    actorUserId: string,
    result: "success" | "failure",
    metadata: Record<string, unknown> = {}
  ) {
    await this.auditLogService.recordAuditAction({
      actorUserId,
      action,
      origin: "backend-api",
      targetType: "morpho_simulation",
      result,
      metadata: {
        ...metadata,
        simulatedOnly: true,
        noFundsMoved: true
      }
    }).catch(() => undefined);
  }

  private getConfiguredMarkets(): MorphoMarketCandidate[] {
    return [
      {
        marketId: "morpho-usdc-bluechip-readonly",
        loanToken: USDC,
        collateralToken: "WETH",
        oracle: "trusted-oracle-placeholder",
        irm: "adaptive-irm-placeholder",
        lltvBps: 8600,
        totalSupplyAssets: 5_000_000_000_000n,
        totalBorrowAssets: 3_500_000_000_000n,
        supplyApyBps: 420,
        liquidityAssets: 1_500_000_000_000n,
        oracleTrusted: true,
        governanceApproved: true
      },
      {
        marketId: "morpho-usdc-high-utilization-watchlist",
        loanToken: USDC,
        collateralToken: "WETH",
        oracle: "trusted-oracle-placeholder",
        irm: "adaptive-irm-placeholder",
        lltvBps: 8600,
        totalSupplyAssets: 5_000_000_000_000n,
        totalBorrowAssets: 4_750_000_000_000n,
        supplyApyBps: 900,
        liquidityAssets: 250_000_000_000n,
        oracleTrusted: true,
        governanceApproved: true
      },
      {
        marketId: "morpho-eurc-documented-only",
        loanToken: "EURC",
        collateralToken: "WETH",
        oracle: "pending-oracle-review",
        irm: "pending-irm-review",
        lltvBps: 7700,
        totalSupplyAssets: 250_000_000_000n,
        totalBorrowAssets: 100_000_000_000n,
        supplyApyBps: 300,
        liquidityAssets: 150_000_000_000n,
        oracleTrusted: false,
        governanceApproved: false
      }
    ];
  }
}

const MORPHO_MARKETS_QUERY = `
  query AivorMorphoMarkets($chainId: Int!, $first: Int!) {
    markets(
      first: $first
      orderBy: SupplyAssetsUsd
      orderDirection: Desc
      where: { chainId_in: [$chainId], listed: true }
    ) {
      items {
        marketId
        lltv
        irmAddress
        oracle { address }
        loanAsset { address symbol decimals }
        collateralAsset { address symbol decimals }
        state {
          borrowAssets
          supplyAssets
          liquidityAssets
          utilization
          supplyApy
        }
        warnings { type level }
      }
    }
  }
`;

interface MorphoGraphQlResponse {
  data?: {
    markets?: {
      items?: MorphoApiMarket[];
    };
  };
  errors?: Array<{ message: string }>;
}

interface MorphoApiMarket {
  marketId: string;
  lltv?: string | number | null;
  irmAddress?: string | null;
  oracle?: { address?: string | null } | null;
  loanAsset?: { symbol?: string | null } | null;
  collateralAsset?: { symbol?: string | null } | null;
  state?: {
    borrowAssets?: string | number | null;
    supplyAssets?: string | number | null;
    liquidityAssets?: string | number | null;
    supplyApy?: string | number | null;
  } | null;
  warnings?: Array<{ type: string; level?: string | null }>;
}

function parseAssetAmount(value: string | number | null | undefined) {
  if (value === null || value === undefined) return 0n;
  const text = String(value);
  if (!text.includes(".")) return BigInt(text);
  const [whole, fraction = ""] = text.split(".");
  return BigInt(`${whole}${fraction.padEnd(6, "0").slice(0, 6)}`);
}

function decimalToBps(value: string | number | null | undefined) {
  if (value === null || value === undefined) return 0;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  if (numeric > 10_000) return Math.round((numeric / 1e18) * 10_000);
  return Math.round(numeric * 10_000);
}

function parseSimulationAmount(value: string | undefined) {
  if (!value) return 0n;
  const text = value.trim();
  if (!text.includes(".")) return BigInt(text);
  const [whole, fraction = ""] = text.split(".");
  return BigInt(`${whole}${fraction.padEnd(6, "0").slice(0, 6)}`);
}

function minBigInt(left: bigint, right: bigint) {
  return left < right ? left : right;
}

interface SimulationPosition {
  allocatedAssets: bigint;
  simulatedYieldAssets: bigint;
  simulatedLossAssets: bigint;
  status: MorphoMarketApprovalStatus;
}

interface SimulationEvent {
  operation: "deposit" | "allocation" | "yield" | "loss" | "rebalance" | "withdraw";
  marketId?: string | null;
  amountAssets: string;
  result: "success" | "failure";
  reason?: string;
  createdAt: string;
}

interface MorphoSimulationState {
  status: "idle" | "running" | "completed" | "failed";
  totalSupply: bigint;
  idleAssets: bigint;
  positions: Map<string, SimulationPosition>;
  recentEvents: SimulationEvent[];
  lastUpdatedAt: string | null;
}
