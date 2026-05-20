import {
  ArrowDownToLine,
  ArrowUpRight,
  Bell,
  Bot,
  ChevronRight,
  CreditCard,
  Eye,
  Fingerprint,
  Settings,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { Button } from "@orvex/ui";
import { getAccountOverview } from "@orvex/sdk";

const overview = getAccountOverview();

const activity = [
  { title: "Rendimento creditado", amount: "+US$ 12,84", date: "Hoje" },
  { title: "Deposito recebido", amount: "+US$ 800,00", date: "Ontem" },
  { title: "Saque concluido", amount: "-US$ 150,00", date: "12 mai" }
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 py-4 text-ink sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[17rem_1fr]">
        <aside className="hidden min-h-[calc(100vh-2rem)] flex-col justify-between rounded-lg border border-line bg-white/78 p-4 shadow-calm lg:flex">
          <div>
            <div className="mb-9 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-forest text-white">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="text-lg font-semibold leading-none">Orvex</p>
                <p className="mt-1 text-xs text-graphite">Conta global</p>
              </div>
            </div>
            <nav className="space-y-1">
              {[
                ["Conta", CreditCard],
                ["Atividades", Bell],
                ["Assistente", Bot],
                ["Seguranca", ShieldCheck],
                ["Ajustes", Settings]
              ].map(([label, Icon]) => (
                <button
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium text-graphite transition hover:bg-mist hover:text-ink"
                  key={label as string}
                >
                  <Icon size={17} />
                  {label as string}
                </button>
              ))}
            </nav>
          </div>
          <div className="rounded-md bg-mist p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Fingerprint size={16} />
              Protecao ativa
            </div>
            <p className="text-xs leading-5 text-graphite">
              Conta protegida por verificacoes continuas e limites operacionais.
            </p>
          </div>
        </aside>

        <section className="space-y-4">
          <header className="flex items-center justify-between rounded-lg border border-line bg-white/78 px-4 py-3 shadow-calm">
            <div>
              <p className="text-sm text-graphite">Boa tarde, Ana</p>
              <h1 className="text-xl font-semibold">Sua conta Orvex</h1>
            </div>
            <button
              aria-label="Mostrar ou ocultar saldo"
              className="flex h-10 w-10 items-center justify-center rounded-md border border-line text-graphite transition hover:bg-mist"
            >
              <Eye size={18} />
            </button>
          </header>

          <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
            <section className="rounded-lg border border-line bg-white p-5 shadow-calm sm:p-7">
              <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-graphite">Saldo total</p>
                  <p className="mt-2 text-4xl font-semibold tracking-normal sm:text-5xl">
                    {overview.balanceUsd}
                  </p>
                </div>
                <div className="rounded-md bg-mint px-3 py-2 text-sm font-semibold text-forest">
                  {overview.monthlyGrowth}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-md border border-line p-4">
                  <p className="text-sm text-graphite">Rendimento</p>
                  <p className="mt-2 text-2xl font-semibold">
                    {overview.earningsUsd}
                  </p>
                </div>
                <div className="rounded-md border border-line p-4">
                  <p className="text-sm text-graphite">Crescimento</p>
                  <p className="mt-2 text-2xl font-semibold">
                    {overview.growthLabel}
                  </p>
                </div>
                <div className="rounded-md border border-line p-4">
                  <p className="text-sm text-graphite">Disponivel</p>
                  <p className="mt-2 text-2xl font-semibold">Agora</p>
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
                <Button className="h-12" variant="ghost">
                  Ver mais
                  <ChevronRight size={17} />
                </Button>
              </div>
            </section>

            <section className="rounded-lg border border-line bg-ink p-5 text-white shadow-calm">
              <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-md bg-white/10">
                <Bot size={20} />
              </div>
              <p className="text-sm text-white/68">Assistente Orvex</p>
              <h2 className="mt-2 text-2xl font-semibold">
                Tire duvidas sobre sua conta
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/72">
                Suporte para onboarding, seguranca, deposito e saque. Sem
                recomendacoes financeiras.
              </p>
              <Button className="mt-8 w-full bg-white text-ink hover:bg-mist">
                Abrir assistente
              </Button>
            </section>
          </div>

          <section className="rounded-lg border border-line bg-white p-5 shadow-calm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Atividades</h2>
              <button className="text-sm font-semibold text-forest">
                Ver todas
              </button>
            </div>
            <div className="divide-y divide-line">
              {activity.map((item) => (
                <div
                  className="flex items-center justify-between gap-4 py-4"
                  key={item.title}
                >
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 text-sm text-graphite">{item.date}</p>
                  </div>
                  <p className="font-semibold">{item.amount}</p>
                </div>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
