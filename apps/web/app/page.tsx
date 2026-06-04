import {
  ArrowDownToLine,
  ArrowUpRight,
  Bell,
  ChartPie,
  CircleDollarSign,
  Eye,
  Settings,
  ShieldCheck,
  UserRound,
  WalletCards
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@orvex/ui";
import { getAccountOverviewFromApi } from "@orvex/sdk";

const activity = [
  { title: "Rendimento creditado", amount: "+US$ 12,84", date: "Hoje" },
  { title: "Deposito recebido", amount: "+US$ 800,00", date: "Ontem" },
  { title: "Saque concluido", amount: "-US$ 150,00", date: "12 mai" }
];

const navigationItems: Array<[string, LucideIcon]> = [
  ["Deposito", CircleDollarSign],
  ["Rendimentos", ArrowUpRight],
  ["Seguranca", ShieldCheck],
  ["Portfolio", ChartPie],
  ["Liquidez", WalletCards],
  ["Perfil", UserRound],
  ["Alertas", Bell],
  ["Configuracoes", Settings]
];

export default async function HomePage() {
  const overview = await getAccountOverviewFromApi(process.env.ORVEX_API_URL);

  return (
    <main className="min-h-screen px-4 py-4 text-white sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[17rem_1fr]">
        <aside className="hidden min-h-[calc(100vh-2rem)] flex-col justify-between rounded-lg border border-line bg-graphite/45 p-4 shadow-calm lg:flex">
          <div>
            <div className="mb-9 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-blue/50 bg-blue/10 text-azure shadow-glow">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-lg font-bold leading-none">Aivor</p>
                <p className="mt-1 text-xs text-silver">Conta global</p>
              </div>
            </div>
            <nav className="grid grid-cols-2 gap-3">
              {navigationItems.map(([label, Icon]) => (
                <button
                  className="flex aspect-square flex-col items-center justify-center gap-3 rounded-lg border border-line bg-ink/70 text-center text-[0.68rem] font-bold uppercase tracking-[0.22em] text-silver transition hover:border-blue/70 hover:text-white"
                  key={label}
                >
                  <Icon className="text-blue" size={24} strokeWidth={1.8} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>
          <div className="rounded-md border border-blue/30 bg-blue/10 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold">
              <ShieldCheck size={16} />
              Protecao ativa
            </div>
            <p className="text-xs leading-5 text-ice">
              Saques e estrategias passam por limites operacionais em contrato.
            </p>
          </div>
        </aside>

        <section className="space-y-4">
          <header className="flex items-center justify-between rounded-lg border border-line bg-graphite/45 px-4 py-3 shadow-calm">
            <div>
              <p className="text-sm text-silver">Boa tarde, Ana</p>
              <h1 className="text-xl font-bold">Sua conta Aivor</h1>
            </div>
            <button
              aria-label="Mostrar ou ocultar saldo"
              className="flex h-10 w-10 items-center justify-center rounded-md border border-line text-silver transition hover:border-blue/70 hover:text-white"
            >
              <Eye size={18} />
            </button>
          </header>

          <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
            <section className="rounded-lg border border-line bg-graphite/55 p-5 shadow-calm sm:p-7">
              <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-silver">Saldo total</p>
                  <p className="mt-2 text-4xl font-bold tracking-normal sm:text-5xl">
                    {overview.balanceUsd}
                  </p>
                </div>
                <div className="rounded-md border border-blue/40 bg-blue/10 px-3 py-2 text-sm font-bold text-ice">
                  {overview.monthlyGrowth}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-md border border-line bg-ink/50 p-4">
                  <p className="text-sm text-silver">Rendimento</p>
                  <p className="mt-2 text-2xl font-bold">
                    {overview.earningsUsd}
                  </p>
                </div>
                <div className="rounded-md border border-line bg-ink/50 p-4">
                  <p className="text-sm text-silver">Crescimento</p>
                  <p className="mt-2 text-2xl font-bold">
                    {overview.growthLabel}
                  </p>
                </div>
                <div className="rounded-md border border-line bg-ink/50 p-4">
                  <p className="text-sm text-silver">Disponivel</p>
                  <p className="mt-2 text-2xl font-bold">Agora</p>
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button className="h-12 flex-1">
                  <ArrowDownToLine size={18} />
                  Adicionar saldo
                </Button>
                <Button className="h-12 flex-1" variant="secondary">
                  <ArrowUpRight size={18} />
                  Sacar
                </Button>
              </div>
            </section>

            <section className="rounded-lg border border-blue/30 bg-blue/10 p-5 text-white shadow-glow">
              <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-md border border-blue/50 text-azure">
                <ShieldCheck size={20} />
              </div>
              <p className="text-sm text-ice">Seguranca</p>
              <h2 className="mt-2 text-2xl font-bold">
                Infraestrutura protegida
              </h2>
              <p className="mt-3 text-sm leading-6 text-ice">
                Fundos movimentados somente por contratos, com controles
                administrativos limitados.
              </p>
              <Button className="mt-8 w-full" variant="secondary">
                Ver status
              </Button>
            </section>
          </div>

          <section className="rounded-lg border border-line bg-graphite/45 p-5 shadow-calm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Atividades</h2>
              <button className="text-sm font-bold text-azure">Ver todas</button>
            </div>
            <div className="divide-y divide-line">
              {activity.map((item) => (
                <div
                  className="flex items-center justify-between gap-4 py-4"
                  key={item.title}
                >
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 text-sm text-silver">{item.date}</p>
                  </div>
                  <p className="font-bold">{item.amount}</p>
                </div>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
