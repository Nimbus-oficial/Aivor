import {
  Activity,
  BadgeDollarSign,
  Banknote,
  BarChart3,
  Landmark,
  WalletCards
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  getAllocatorReadinessFromApi,
  getAllocatorStatusFromApi,
  getAdminVaultOverviewFromApi,
  getGovernanceOverviewFromApi,
  getMorphoMarketsFromApi,
  getMorphoSimulationFromApi,
  getOperationalPolicyFromApi,
  getSystemHealthFromApi
} from "@orvex/sdk";

type SourceTone = "real" | "read_only" | "simulated" | "active" | "pending";

interface StatusPillProps {
  label: string;
  tone?: SourceTone;
}

interface PanelProps {
  eyebrow: string;
  title: string;
  status: string;
  source: string;
  mode: string;
  children: ReactNode;
}

interface MetricProps {
  label: string;
  value: string;
  sublabel?: string;
  icon: LucideIcon;
  source: string;
}

const modulePriority = [
  "Dashboard Executivo",
  "Governanca",
  "Risco",
  "Liquidez",
  "Estrategias",
  "Tesouraria",
  "Auditoria"
];

export default async function AdminPage() {
  const [admin, governance, policy, health, morpho, morphoSimulation, allocator, readiness] = await Promise.all([
    getAdminVaultOverviewFromApi(process.env.ORVEX_API_URL),
    getGovernanceOverviewFromApi(process.env.ORVEX_API_URL),
    getOperationalPolicyFromApi(process.env.ORVEX_API_URL),
    getSystemHealthFromApi(process.env.ORVEX_API_URL),
    getMorphoMarketsFromApi(process.env.ORVEX_API_URL),
    getMorphoSimulationFromApi(process.env.ORVEX_API_URL),
    getAllocatorStatusFromApi(process.env.ORVEX_API_URL),
    getAllocatorReadinessFromApi(process.env.ORVEX_API_URL)
  ]);

  const metricCards = [
    {
      label: "TVL",
      value: admin.tvlUsd,
      sublabel: "Patrimonio monitorado",
      icon: Landmark,
      source: admin.dataSource
    },
    {
      label: "Rendimento",
      value: admin.yieldUsd,
      sublabel: "Leitura operacional",
      icon: BarChart3,
      source: admin.dataSource
    },
    {
      label: "Liquidez",
      value: admin.availableLiquidityUsd,
      sublabel: `Alvo ${admin.idleLiquidityTarget}`,
      icon: WalletCards,
      source: admin.dataSource
    },
    {
      label: "Fees",
      value: admin.feesGeneratedUsd,
      sublabel: "Tesouraria",
      icon: BadgeDollarSign,
      source: admin.dataSource
    },
    {
      label: "Entradas 24h",
      value: admin.deposits24hUsd,
      sublabel: "Fluxo operacional",
      icon: Activity,
      source: admin.dataSource
    },
    {
      label: "Saidas 24h",
      value: admin.withdrawals24hUsd,
      sublabel: "Fluxo operacional",
      icon: Banknote,
      source: admin.dataSource
    }
  ];

  const riskRows = [
    ["Liquidez minima", `${policy.liquidity.minBps / 100}%`, "active"],
    ["Liquidez alvo", `${policy.liquidity.targetBps / 100}%`, "active"],
    ["Liquidez maxima", `${policy.liquidity.maxBps / 100}%`, "active"],
    ["Fonte financeira final", policy.custody.finalFinancialSource, "read_only"],
    ["Banco como patrimonio", policy.custody.databaseIsFinalFinancialSource ? "sim" : "nao", "active"],
    ["Backend custodial", policy.custody.backendCustodiesFunds ? "sim" : "nao", "active"]
  ] as const;

  const healthRows = [
    ["Backend", health.backend.status, "real"],
    ["Database", health.database.status, "real"],
    ["RPC", health.rpc.status, health.rpc.status === "ok" ? "read_only" : "pending"],
    [
      "Governanca",
      health.governance.status,
      health.governance.status === "ok" ? "read_only" : "pending"
    ]
  ] as const;

  return (
    <main className="min-h-screen bg-ink px-4 py-4 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1500px] gap-4 xl:grid-cols-[240px_1fr]">
        <aside className="rounded-lg border border-line bg-graphite/70 p-4 shadow-calm xl:sticky xl:top-4 xl:h-[calc(100vh-2rem)]">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-azure">
            Aivor Admin
          </p>
          <h1 className="mt-3 text-xl font-bold leading-tight">
            Centro Operacional
          </h1>
          <div className="mt-5 space-y-2">
            {modulePriority.map((item, index) => (
              <div
                className="flex items-center justify-between rounded-md border border-line bg-ink/50 px-3 py-2 text-sm"
                key={item}
              >
                <span className="text-silver">{item}</span>
                <span className="font-bold text-ice">{index + 1}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-md border border-blue/30 bg-blue/10 p-3 text-sm text-ice">
            <p className="font-bold">Modo operacional</p>
            <p className="mt-1 text-silver">
              Read-only e simulated ate aprovacao de governanca.
            </p>
          </div>
        </aside>

        <div className="space-y-4">
          <header className="rounded-lg border border-line bg-graphite/65 p-5 shadow-calm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-azure">
                  Dashboard Executivo
                </p>
                <h2 className="mt-2 text-2xl font-bold">
                  Operacao institucional do protocolo
                </h2>
              </div>
              <div className="grid gap-2 text-sm sm:grid-cols-4">
                <StatusPill label={admin.contractStatus} tone="active" />
                <StatusPill label={admin.dataSource} tone={sourceTone(admin.dataSource)} />
                <StatusPill label={governance.mode} tone={sourceTone(governance.mode)} />
                <StatusPill
                  label={health.rpc.chainId ? `Base ${health.rpc.chainId}` : "RPC pendente"}
                  tone={health.rpc.status === "ok" ? "read_only" : "pending"}
                />
              </div>
            </div>
          </header>

          <section className="grid gap-3 md:grid-cols-3 2xl:grid-cols-6">
            {metricCards.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </section>

          <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
            <Panel
              eyebrow="Governanca"
              title="Safe + Timelock"
              status={governance.safeStatus}
              source="Safe API / Backend"
              mode="read_only"
            >
              <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
                <DataPoint label="Safe" value={governance.safeConfigured ? "configurada" : "pendente"} />
                <DataPoint label="Chain" value={governance.safeChainId?.toString() ?? "pendente"} />
                <DataPoint label="Threshold" value={governance.safeThreshold?.toString() ?? "pendente"} />
                <DataPoint
                  label="Politica 2-of-4"
                  value={
                    governance.safePolicyMatches === null
                      ? "pendente"
                      : governance.safePolicyMatches
                        ? "ok"
                        : "dev safe"
                  }
                />
              </div>
              <div className="mt-4 rounded-md border border-line bg-ink/55 p-4">
                <p className="text-sm font-bold text-white">Safe address</p>
                <p className="mt-2 break-all text-sm text-silver">
                  {governance.safeAddress ?? "pendente"}
                </p>
                <p className="mt-4 text-sm font-bold text-white">Signers</p>
                <p className="mt-2 break-all text-sm text-silver">
                  {governance.safeOwners.length
                    ? governance.safeOwners.join(", ")
                    : "pendente"}
                </p>
              </div>
              <div className="mt-4 divide-y divide-line">
                {governance.proposals.length ? (
                  governance.proposals.slice(0, 4).map((proposal) => (
                    <div className="flex items-center justify-between gap-4 py-3" key={proposal.id}>
                      <div>
                        <p className="font-bold">{proposal.title}</p>
                        <p className="mt-1 text-sm text-silver">{proposal.type}</p>
                      </div>
                      <StatusPill label={proposal.status} tone={sourceTone(proposal.status)} />
                    </div>
                  ))
                ) : (
                  <p className="rounded-md border border-line bg-ink/55 p-4 text-sm text-silver">
                    Nenhuma proposta registrada.
                  </p>
                )}
              </div>
            </Panel>

            <Panel
              eyebrow="Risco"
              title="Politica operacional"
              status="monitoring"
              source="Operational settings"
              mode="active"
            >
              <div className="grid gap-3 md:grid-cols-2">
                {riskRows.map(([label, value, tone]) => (
                  <DataPoint key={label} label={label} value={value} tone={tone} />
                ))}
              </div>
              <div className="mt-4 rounded-md border border-line bg-ink/55 p-4">
                <p className="text-sm font-bold">Circuit breakers</p>
                <div className="mt-3 grid gap-2 text-sm text-silver sm:grid-cols-2">
                  <span>Liquidez abaixo de 2%</span>
                  <span>APY anormal</span>
                  <span>Falha de RPC</span>
                  <span>Safe/Timelock indisponivel</span>
                </div>
              </div>
            </Panel>
          </section>

          <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <Panel
              eyebrow="Liquidez"
              title="Faixa operacional"
              status={admin.contractStatus}
              source={admin.dataSource}
              mode={admin.dataSource === "onchain" ? "read_only" : "simulated"}
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <DataPoint label="Minima" value={`${policy.liquidity.minBps / 100}%`} />
                <DataPoint label="Alvo" value={`${policy.liquidity.targetBps / 100}%`} />
                <DataPoint label="Maxima" value={`${policy.liquidity.maxBps / 100}%`} />
              </div>
              <div className="mt-4 h-3 rounded-full bg-carbon">
                <div className="h-3 w-[50%] rounded-full bg-blue" />
              </div>
              <p className="mt-3 text-sm text-silver">
                Liquidez atual: {admin.availableLiquidityUsd}. Fonte: {admin.dataSource}.
              </p>
            </Panel>

            <Panel
              eyebrow="Estrategias"
              title="Morpho read-only"
              status="controlled"
              source={morpho.dataSource}
              mode={morpho.mode}
            >
              <div className="mb-4 rounded-md border border-line bg-ink/55 p-4 text-sm text-silver">
                <p>
                  Origem: <span className="font-bold text-white">{morpho.dataSource}</span>
                </p>
                <p className="mt-1">
                  Ultima atualizacao:{" "}
                  <span className="font-bold text-white">
                    {morpho.lastUpdatedAt ?? "fallback sem timestamp real"}
                  </span>
                </p>
                <p className="mt-1">
                  Freshness:{" "}
                  <span className="font-bold text-white">
                    {morpho.stale ? "stale" : `ok ate ${morpho.maxAgeSeconds ?? 300}s`}
                  </span>
                </p>
              </div>
              <div className="space-y-3">
                {morpho.markets.length ? (
                  morpho.markets.map((market) => (
                  <div className="rounded-md border border-line bg-ink/55 p-4" key={market.marketId}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold">{market.loanToken} / {market.collateralToken}</p>
                        <p className="mt-1 text-sm text-silver">
                          {market.marketId}
                        </p>
                      </div>
                      <StatusPill label={market.status} tone={sourceTone(market.status)} />
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-4">
                      <DataPoint label="APY" value={`${market.supplyApyBps / 100}%`} />
                      <DataPoint label="Liquidez" value={formatRawUsdc(market.liquidityAssets)} />
                      <DataPoint label="Utilizacao" value={`${market.utilizationBps / 100}%`} />
                      <DataPoint label="LLTV" value={`${market.lltvBps / 100}%`} />
                    </div>
                    <p className="mt-3 text-sm text-silver">{market.statusReason}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {["Aprovar", "Rejeitar", "Desabilitar"].map((action) => (
                        <button
                          className="rounded-md border border-line bg-carbon px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-silver"
                          disabled
                          key={`${market.marketId}-${action}`}
                          type="button"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-silver">
                      Acoes exigem sessao admin e auditoria no backend.
                    </p>
                  </div>
                  ))
                ) : (
                  <p className="rounded-md border border-line bg-ink/55 p-4 text-sm text-silver">
                    Nenhum mercado Morpho configurado para leitura.
                  </p>
                )}
              </div>
            </Panel>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
            <Panel
              eyebrow="Allocator"
              title="Morpho real read-only"
              status={allocator.isHealthy ? "healthy" : "disabled"}
              source="onchain"
              mode="read_only"
            >
              <div className="mb-4 grid gap-2 sm:grid-cols-3">
                <StatusPill label="READ_ONLY" tone="read_only" />
                <StatusPill label={allocator.flags.noCapital ? "NO_CAPITAL" : "CAPITAL"} tone="simulated" />
                <StatusPill label={allocator.flags.noSupply ? "NO_SUPPLY" : "SUPPLY"} tone="simulated" />
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <DataPoint label="Total assets" value={formatRawUsdc(allocator.totalAssets ?? "0")} />
                <DataPoint label="Liquid assets" value={formatRawUsdc(allocator.liquidAssets ?? "0")} />
                <DataPoint label="Exposure" value={`${(allocator.exposureBps ?? 0) / 100}%`} />
                <DataPoint label="Protocol" value={allocator.protocolEnabled ? "enabled" : "disabled"} tone={allocator.protocolEnabled ? "active" : "pending"} />
                <DataPoint label="Market" value={allocator.marketEnabled ? "enabled" : "disabled"} tone={allocator.marketEnabled ? "active" : "pending"} />
                <DataPoint label="Freshness" value={allocator.stale ? "stale" : "fresh"} tone={allocator.stale ? "pending" : "active"} />
              </div>
              <div className="mt-4 rounded-md border border-line bg-ink/55 p-4 text-sm text-silver">
                <p className="font-bold text-white">Allocator</p>
                <p className="mt-2 break-all">{allocator.allocatorAddress ?? "pendente"}</p>
                <p className="mt-3 font-bold text-white">Market</p>
                <p className="mt-2 break-all">{allocator.marketId ?? "pendente"}</p>
                <p className="mt-3">
                  Limite: {formatRawUsdc(allocator.exposureLimit ?? "0")} · usado:{" "}
                  {formatRawUsdc(allocator.exposureUsed ?? "0")}
                </p>
              </div>
            </Panel>

            <Panel
              eyebrow="Readiness"
              title="Activation preparation"
              status={readiness.status}
              source="backend/readiness"
              mode={readiness.mode}
            >
              <div className="mb-4 grid gap-2 sm:grid-cols-3">
                <StatusPill label="NO_ENABLE" tone="read_only" />
                <StatusPill label="NO_SUPPLY" tone="read_only" />
                <StatusPill label="NO_CAPITAL" tone="read_only" />
              </div>
              <div className="grid gap-3 md:grid-cols-4">
                <DataPoint
                  label="Dev validation"
                  value={readiness.devValidationStatus}
                  tone={readiness.devValidationStatus === "READY" ? "active" : "pending"}
                />
                <DataPoint
                  label="Production"
                  value={readiness.productionStatus}
                  tone={readiness.productionStatus === "READY" ? "active" : "pending"}
                />
                <DataPoint
                  label="Activation"
                  value={readiness.activation.protocolEnablePrepared ? "prepared" : "pending"}
                  tone={readiness.activation.protocolEnablePrepared ? "active" : "pending"}
                />
                <DataPoint
                  label="Rollback"
                  value={readiness.checks.some((check) => check.key === "runbooks" && check.status === "READY") ? "prepared" : "pending"}
                  tone={readiness.checks.some((check) => check.key === "runbooks" && check.status === "READY") ? "active" : "pending"}
                />
                <DataPoint
                  label="Exposure"
                  value={formatRawUsdc(readiness.exposure.maxMarketExposure)}
                  tone="read_only"
                />
                <DataPoint
                  label="Initial capital"
                  value={formatRawUsdc(readiness.exposure.initialCapitalLimit)}
                  tone="read_only"
                />
                <DataPoint
                  label="Dev Safe"
                  value={readiness.devValidation.devSafeAccepted ? "accepted" : "pending"}
                  tone={readiness.devValidation.devSafeAccepted ? "active" : "pending"}
                />
                <DataPoint
                  label="Production Safe"
                  value={readiness.production.productionReadySafe ? "ready" : "not ready"}
                  tone={readiness.production.productionReadySafe ? "active" : "pending"}
                />
              </div>
              <p className="mt-4 rounded-md border border-line bg-ink/55 p-3 text-sm text-silver">
                {readiness.devValidation.reason}
              </p>
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {readiness.checks.map((check) => (
                  <div className="rounded-md border border-line bg-ink/55 p-3" key={check.key}>
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-bold">{check.label}</p>
                      <StatusPill label={check.status} tone={sourceTone(check.status)} />
                    </div>
                    <p className="mt-2 text-sm text-silver">{check.reason}</p>
                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-azure">
                      {check.source}
                    </p>
                  </div>
                ))}
              </div>
            </Panel>

          </section>

          <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
            <Panel
              eyebrow="Capital Validation"
              title="First capital readiness"
              status={readiness.capitalValidation.status}
              source="backend/readiness"
              mode="preparation"
            >
              <div className="mb-4 grid gap-2 sm:grid-cols-3">
                <StatusPill label="NO_TX" tone="read_only" />
                <StatusPill label="NO_SUPPLY" tone="read_only" />
                <StatusPill label="NO_ENABLE" tone="read_only" />
              </div>
              <div className="grid gap-3 md:grid-cols-4">
                <DataPoint
                  label="Proposed capital"
                  value={formatRawUsdc(readiness.capitalValidation.recommendedInitialCapital)}
                  tone="simulated"
                />
                <DataPoint
                  label="Max capital"
                  value={formatRawUsdc(readiness.capitalValidation.maxCapital)}
                  tone="simulated"
                />
                <DataPoint
                  label="Exposure limit"
                  value={formatRawUsdc(readiness.capitalValidation.exposureLimit)}
                  tone="read_only"
                />
                <DataPoint
                  label="Rollback"
                  value={readiness.capitalValidation.rollbackReady ? "ready" : "not ready"}
                  tone={readiness.capitalValidation.rollbackReady ? "active" : "pending"}
                />
                <DataPoint
                  label="Proposal"
                  value={readiness.capitalValidation.proposalPrepared ? "prepared" : "pending"}
                  tone={readiness.capitalValidation.proposalPrepared ? "active" : "pending"}
                />
                <DataPoint
                  label="First USDC"
                  value={readiness.capitalValidation.readyForFirstUsdc ? "allowed" : "blocked"}
                  tone="pending"
                />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-md border border-line bg-ink/55 p-4">
                  <p className="font-bold">Success criteria</p>
                  <ul className="mt-3 space-y-2 text-sm text-silver">
                    {readiness.capitalValidation.successCriteria.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-md border border-line bg-ink/55 p-4">
                  <p className="font-bold">Failure criteria</p>
                  <ul className="mt-3 space-y-2 text-sm text-silver">
                    {readiness.capitalValidation.failureCriteria.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Panel>

            <Panel
              eyebrow="Morpho Integration Path"
              title="Operational path"
              status={readiness.morphoPath.status}
              source="onchain/readiness"
              mode="diagnostic"
            >
              <div className="grid gap-3 md:grid-cols-2">
                <DataPoint
                  label="Vault connected"
                  value={readiness.morphoPath.vaultConnectedToAllocator ? "yes" : "no"}
                  tone={readiness.morphoPath.vaultConnectedToAllocator ? "active" : "pending"}
                />
                <DataPoint
                  label="Allocator vault"
                  value={readiness.morphoPath.allocatorConnectedToVault ? "yes" : "no"}
                  tone={readiness.morphoPath.allocatorConnectedToVault ? "active" : "pending"}
                />
                <DataPoint
                  label="Allocator controller"
                  value={readiness.morphoPath.allocatorConnectedToController ? "yes" : "no"}
                  tone={readiness.morphoPath.allocatorConnectedToController ? "active" : "pending"}
                />
                <DataPoint
                  label="Governance path"
                  value={readiness.morphoPath.controllerCanOperateAllocator ? "available" : "missing"}
                  tone={readiness.morphoPath.controllerCanOperateAllocator ? "active" : "pending"}
                />
                <DataPoint
                  label="Operational path"
                  value={readiness.morphoPath.operationalPathComplete ? "complete" : "blocked"}
                  tone={readiness.morphoPath.operationalPathComplete ? "active" : "pending"}
                />
                <DataPoint
                  label="Recommended option"
                  value={readiness.morphoPath.recommendedOption}
                  tone="simulated"
                />
                <DataPoint
                  label="V2 deploy config"
                  value={readiness.morphoPath.v2DeployReady ? "ready" : "not ready"}
                  tone={readiness.morphoPath.v2DeployReady ? "active" : "pending"}
                />
                <DataPoint
                  label="V2 nonce safety"
                  value={readiness.morphoPath.v2NonceSafe ? "reviewed" : "manual review required"}
                  tone={readiness.morphoPath.v2NonceSafe ? "active" : "simulated"}
                />
                <DataPoint
                  label="V2 dry-run"
                  value={readiness.morphoPath.v2DryRunPassed ? "passed" : "not persisted"}
                  tone={readiness.morphoPath.v2DryRunPassed ? "active" : "simulated"}
                />
                <DataPoint
                  label="Capital movement"
                  value={readiness.morphoPath.v2NoCapitalMovement ? "zero" : "review"}
                  tone={readiness.morphoPath.v2NoCapitalMovement ? "active" : "pending"}
                />
                <DataPoint
                  label="Broadcast"
                  value={readiness.morphoPath.v2ReadyForBroadcast ? "ready" : "requires approval"}
                  tone={readiness.morphoPath.v2ReadyForBroadcast ? "active" : "pending"}
                />
                <DataPoint
                  label="Activation simulation"
                  value={readiness.morphoPath.activationSimulationPassed ? "READY" : "NOT_TESTED"}
                  tone={readiness.morphoPath.activationSimulationPassed ? "active" : "simulated"}
                />
              </div>
              <p className="mt-4 rounded-md border border-line bg-ink/55 p-3 text-sm text-silver">
                {readiness.morphoPath.diagnosis}
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {readiness.morphoPath.sets.map((set) => (
                  <div key={set.name} className="rounded-md border border-line bg-ink/55 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold">{set.name}</p>
                      <StatusPill
                        label={set.status}
                        tone={set.status === "READY" ? "active" : set.status === "BLOCKED" ? "pending" : "simulated"}
                      />
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-silver">
                      <p>Vault: {shortAddress(set.vaultAddress)}</p>
                      <p>Controller: {shortAddress(set.controllerAddress)}</p>
                      <p>Allocator: {shortAddress(set.allocatorAddress)}</p>
                      <p>Path: {set.pathComplete ? "complete" : "not complete"}</p>
                    </div>
                    <p className="mt-3 text-xs text-muted">{set.note}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel
              eyebrow="Allocator"
              title="Morpho simulado"
              status={morphoSimulation.status}
              source="backend/simulation"
              mode={morphoSimulation.mode}
            >
              <div className="grid gap-3 md:grid-cols-3">
                <DataPoint label="Total assets" value={formatRawUsdc(morphoSimulation.totalAssets)} />
                <DataPoint label="Idle" value={formatRawUsdc(morphoSimulation.idleAssets)} />
                <DataPoint label="Alocado" value={formatRawUsdc(morphoSimulation.allocatedAssets)} />
                <DataPoint label="Share price" value={formatSharePrice(morphoSimulation.sharePrice)} />
                <DataPoint label="Yield simulado" value={formatRawUsdc(morphoSimulation.simulatedYieldAssets)} />
                <DataPoint label="Perda simulada" value={formatRawUsdc(morphoSimulation.simulatedLossAssets)} />
              </div>
              <div className="mt-4 rounded-md border border-line bg-ink/55 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold">Exposicao</p>
                  <StatusPill
                    label={`${morphoSimulation.exposureBps / 100}% / ${morphoSimulation.maxExposureBps / 100}%`}
                    tone={morphoSimulation.exposureBps > morphoSimulation.maxExposureBps ? "pending" : "simulated"}
                  />
                </div>
                <div className="mt-3 h-3 rounded-full bg-carbon">
                  <div
                    className="h-3 rounded-full bg-gold"
                    style={{
                      width: `${Math.min(
                        100,
                        morphoSimulation.maxExposureBps
                          ? (morphoSimulation.exposureBps / morphoSimulation.maxExposureBps) * 100
                          : 0
                      )}%`
                    }}
                  />
                </div>
                <p className="mt-3 text-sm text-silver">
                  Simulacao interna. Nenhum USDC e enviado ao Morpho por este painel.
                </p>
              </div>
            </Panel>

            <Panel
              eyebrow="Simulacao"
              title="Eventos e mercados"
              status={morphoSimulation.stale ? "stale" : "fresh"}
              source="backend/simulation"
              mode="simulated"
            >
              <div className="grid gap-3 md:grid-cols-2">
                {morphoSimulation.positions.length ? (
                  morphoSimulation.positions.map((position) => (
                    <div className="rounded-md border border-line bg-ink/55 p-3" key={position.marketId}>
                      <div className="flex items-start justify-between gap-3">
                        <p className="break-all text-sm font-bold">{position.marketId}</p>
                        <StatusPill label={position.status} tone={sourceTone(position.status)} />
                      </div>
                      <div className="mt-3 grid gap-2">
                        <DataPoint label="Alocado" value={formatRawUsdc(position.allocatedAssets)} />
                        <DataPoint label="Yield" value={formatRawUsdc(position.simulatedYieldAssets)} />
                        <DataPoint label="Loss" value={formatRawUsdc(position.simulatedLossAssets)} />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-md border border-line bg-ink/55 p-4 text-sm text-silver">
                    Nenhuma posicao simulada registrada.
                  </p>
                )}
              </div>
              <div className="mt-4 divide-y divide-line rounded-md border border-line bg-ink/55 px-4">
                {morphoSimulation.recentEvents.length ? (
                  morphoSimulation.recentEvents.slice(0, 5).map((event) => (
                    <div className="grid gap-1 py-3 text-sm" key={`${event.createdAt}-${event.operation}`}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-bold">{event.operation}</span>
                        <StatusPill label={event.result} tone={event.result === "success" ? "active" : "pending"} />
                      </div>
                      <span className="text-silver">
                        {formatRawUsdc(event.amountAssets)} {event.marketId ? `em ${event.marketId}` : ""}
                      </span>
                      {event.reason ? <span className="text-silver">{event.reason}</span> : null}
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-sm text-silver">Nenhum evento de simulacao.</p>
                )}
              </div>
            </Panel>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
            <Panel
              eyebrow="Tesouraria"
              title="Visao financeira interna"
              status="read_only"
              source="backend/mock"
              mode="simulated"
            >
              <div className="grid gap-3 md:grid-cols-3">
                <DataPoint label="Fees geradas" value={admin.feesGeneratedUsd} />
                <DataPoint label="Reservas" value="pendente" tone="pending" />
                <DataPoint label="Runway" value="pendente" tone="pending" />
              </div>
              <p className="mt-4 text-sm text-silver">
                Tesouraria separada do patrimonio dos usuarios. Nenhuma movimentacao direta pelo painel.
              </p>
            </Panel>

            <Panel
              eyebrow="Auditoria"
              title="Saude e rastreabilidade"
              status="monitoring"
              source="health endpoints"
              mode="read_only"
            >
              <div className="grid gap-3 md:grid-cols-2">
                {healthRows.map(([label, value, tone]) => (
                  <DataPoint key={label} label={label} value={value} tone={tone} />
                ))}
              </div>
              <p className="mt-4 text-sm text-silver">
                Logs e propostas ficam no backend operacional. Blockchain permanece fonte final para patrimonio.
              </p>
            </Panel>
          </section>
        </div>
      </div>
    </main>
  );
}

function Panel({ eyebrow, title, status, source, mode, children }: PanelProps) {
  return (
    <section className="rounded-lg border border-line bg-graphite/60 p-5 shadow-calm">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-azure">
            {eyebrow}
          </p>
          <h3 className="mt-2 text-xl font-bold">{title}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusPill label={status} tone={sourceTone(status)} />
          <StatusPill label={mode} tone={sourceTone(mode)} />
          <StatusPill label={source} tone={sourceTone(source)} />
        </div>
      </div>
      {children}
    </section>
  );
}

function MetricCard({ label, value, sublabel, icon: Icon, source }: MetricProps) {
  return (
    <div className="rounded-lg border border-line bg-graphite/60 p-4 shadow-calm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-silver">
          {label}
        </p>
        <Icon className="text-azure" size={18} />
      </div>
      <p className="mt-3 text-xl font-bold">{value}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-xs text-silver">{sublabel}</p>
        <StatusPill label={source} tone={sourceTone(source)} />
      </div>
    </div>
  );
}

function DataPoint({
  label,
  value,
  tone = "read_only"
}: {
  label: string;
  value: string;
  tone?: SourceTone | string;
}) {
  return (
    <div className="rounded-md border border-line bg-ink/55 p-3">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-silver">
        {label}
      </p>
      <div className="mt-2 grid gap-2">
        <p className="break-words font-bold leading-snug text-white">{value}</p>
        <StatusPill label={tone} tone={sourceTone(tone)} />
      </div>
    </div>
  );
}

function StatusPill({ label, tone = "pending" }: StatusPillProps) {
  const styles = {
    real: "border-mint/40 bg-mint/10 text-mint",
    read_only: "border-blue/40 bg-blue/10 text-ice",
    simulated: "border-gold/40 bg-gold/10 text-gold",
    active: "border-mint/40 bg-mint/10 text-mint",
    pending: "border-line bg-ink/70 text-silver"
  } satisfies Record<SourceTone, string>;

  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-md border px-2 py-1 text-xs font-bold uppercase tracking-[0.12em] ${styles[tone]}`}
    >
      {label}
    </span>
  );
}

function sourceTone(value: string): SourceTone {
  const normalized = value.toLowerCase();
  if (normalized.includes("ready")) {
    return "active";
  }
  if (normalized.includes("blocked")) {
    return "pending";
  }
  if (normalized.includes("onchain") || normalized.includes("database") || normalized === "ok") {
    return "real";
  }
  if (normalized.includes("read") || normalized.includes("safe_readonly")) {
    return "read_only";
  }
  if (normalized.includes("simulated") || normalized.includes("mock")) {
    return "simulated";
  }
  if (normalized.includes("active") || normalized.includes("healthy") || normalized.includes("monitor")) {
    return "active";
  }
  if (normalized.includes("eligible")) {
    return "active";
  }
  if (normalized.includes("watchlist")) {
    return "simulated";
  }
  if (normalized.includes("disabled") || normalized.includes("rejected")) {
    return "pending";
  }
  return "pending";
}

function formatRawUsdc(value: string) {
  const raw = BigInt(value);
  const scale = 1_000_000n;
  const whole = raw / scale;
  const cents = (raw % scale) / 10_000n;
  return `US$ ${whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${cents
    .toString()
    .padStart(2, "0")}`;
}

function shortAddress(value: string | null) {
  if (!value) return "not configured";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function formatSharePrice(value: string) {
  const raw = BigInt(value);
  const scale = 1_000_000n;
  const whole = raw / scale;
  const decimals = raw % scale;
  return `${whole.toString()},${decimals.toString().padStart(6, "0")} USDC`;
}
