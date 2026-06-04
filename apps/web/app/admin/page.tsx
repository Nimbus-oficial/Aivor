import {
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  PauseCircle,
  ShieldCheck,
  SlidersHorizontal,
  WalletCards
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@orvex/ui";
import { getAdminVaultOverviewFromApi } from "@orvex/sdk";

const controls: Array<[string, string, LucideIcon]> = [
  ["Pause", "Depositos e alocacoes", PauseCircle],
  ["Shutdown", "Modo emergencia", AlertTriangle],
  ["Withdraw", "Liquidez para vault", WalletCards],
  ["Rebalance", "Exposicao por market", ArrowRightLeft]
];

export default async function AdminPage() {
  const admin = await getAdminVaultOverviewFromApi(process.env.ORVEX_API_URL);
  const metricCards = [
    ["TVL", admin.tvlUsd],
    ["Rendimento", admin.yieldUsd],
    ["Liquidez", admin.availableLiquidityUsd],
    ["Fees", admin.feesGeneratedUsd],
    ["Entradas 24h", admin.deposits24hUsd],
    ["Saidas 24h", admin.withdrawals24hUsd]
  ];

  return (
    <main className="min-h-screen px-4 py-4 text-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="flex flex-col gap-4 rounded-lg border border-line bg-graphite/50 p-5 shadow-calm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-azure">
              Admin Panel
            </p>
            <h1 className="mt-2 text-2xl font-bold">Aivor Vault Operations</h1>
          </div>
          <div className="grid gap-2 text-sm text-silver sm:grid-cols-3">
            <div className="rounded-md border border-line bg-ink/60 px-3 py-2">
              <p className="text-xs uppercase tracking-[0.18em]">Status</p>
              <p className="mt-1 font-bold text-white">{admin.contractStatus}</p>
            </div>
            <div className="rounded-md border border-line bg-ink/60 px-3 py-2">
              <p className="text-xs uppercase tracking-[0.18em]">Multisig</p>
              <p className="mt-1 font-bold text-white">{admin.multisigPolicy}</p>
            </div>
            <div className="rounded-md border border-line bg-ink/60 px-3 py-2">
              <p className="text-xs uppercase tracking-[0.18em]">Timelock</p>
              <p className="mt-1 font-bold text-white">{admin.timelockDelay}</p>
            </div>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {metricCards.map(([label, value]) => (
            <div
              className="rounded-lg border border-line bg-graphite/45 p-4 shadow-calm"
              key={label}
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-silver">
                {label}
              </p>
              <p className="mt-3 text-xl font-bold">{value}</p>
            </div>
          ))}
        </section>

        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-lg border border-line bg-graphite/45 p-5 shadow-calm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-silver">Estrategias</p>
                <h2 className="text-xl font-bold">Morpho Markets</h2>
              </div>
              <Button variant="secondary">
                <SlidersHorizontal size={17} />
                Ajustar
              </Button>
            </div>

            <div className="space-y-3">
              {admin.strategies.map((strategy) => (
                <div
                  className="rounded-md border border-line bg-ink/55 p-4"
                  key={strategy.name}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold">{strategy.name}</p>
                      <p className="mt-1 text-sm text-silver">
                        Alvo {strategy.targetAllocation} · Atual{" "}
                        {strategy.currentAllocation}
                      </p>
                    </div>
                    <span className="rounded-md border border-blue/40 bg-blue/10 px-2 py-1 text-xs font-bold uppercase tracking-[0.16em] text-ice">
                      {strategy.status}
                    </span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-carbon">
                    <div
                      className="h-2 rounded-full bg-blue"
                      style={{ width: strategy.currentAllocation }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-line bg-graphite/45 p-5 shadow-calm">
            <div className="mb-5">
              <p className="text-sm text-silver">Controles</p>
              <h2 className="text-xl font-bold">Operacoes criticas</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {controls.map(([title, subtitle, Icon]) => (
                <button
                  className="rounded-lg border border-line bg-ink/55 p-4 text-left transition hover:border-blue/70"
                  key={title}
                >
                  <Icon className="text-blue" size={22} />
                  <p className="mt-4 font-bold">{title}</p>
                  <p className="mt-1 text-sm text-silver">{subtitle}</p>
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-3 rounded-md border border-blue/30 bg-blue/10 p-4">
              <div className="flex items-center gap-3">
                <LockKeyhole className="text-azure" size={19} />
                <p className="font-bold">{admin.multisigPolicy}</p>
              </div>
              <div className="flex items-center gap-3">
                <Clock3 className="text-azure" size={19} />
                <p className="font-bold">{admin.timelockDelay}</p>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-azure" size={19} />
                <p className="font-bold">
                  Idle liquidity {admin.idleLiquidityTarget}
                </p>
              </div>
            </div>
          </section>
        </div>

        <section className="rounded-lg border border-line bg-graphite/45 p-5 shadow-calm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-silver">Token interno</p>
              <h2 className="text-xl font-bold">{admin.shareToken.name}</h2>
              <p className="mt-2 text-sm text-silver">
                {admin.shareToken.ticker} · Share price · Non-rebasing
              </p>
            </div>
            <CheckCircle2 className="text-blue" size={24} />
          </div>
        </section>
      </div>
    </main>
  );
}
