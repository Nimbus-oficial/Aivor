import {
  ArrowRight,
  BarChart3,
  CircleDollarSign,
  FileText,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  WalletCards
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@orvex/ui";

const pillars: Array<{
  title: string;
  text: string;
  icon: LucideIcon;
}> = [
  {
    title: "Vault USDC",
    text: "Aivor organiza depósitos em USDC em um vault ERC4626, com saldo apresentado em linguagem simples.",
    icon: CircleDollarSign
  },
  {
    title: "Auto-custódia",
    text: "O backend não guarda chaves privadas e não controla fundos. Movimentação financeira acontece em contratos.",
    icon: WalletCards
  },
  {
    title: "Governança operacional",
    text: "Safe, timelock, limites e auditoria reduzem o risco de decisões administrativas apressadas.",
    icon: ShieldCheck
  },
  {
    title: "Transparência",
    text: "Status, contratos, mercados e riscos devem ser visíveis antes de qualquer ativação com capital.",
    icon: FileText
  }
];

const statuses = [
  ["Vault V2", "deploy privado"],
  ["Morpho", "controle progressivo"],
  ["Safe", "timelock em espera"],
  ["Capital", "não público"]
];

export default function LandingPage() {
  return (
    <main className="min-h-screen text-white">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4 border-b border-line pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-blue/50 bg-blue/10 text-azure shadow-glow">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-lg font-bold leading-none">Aivor</p>
              <p className="mt-1 text-xs text-silver">@aivorlabs</p>
            </div>
          </div>
          <a
            className="rounded-md border border-line px-3 py-2 text-sm font-bold text-silver transition hover:border-blue/70 hover:text-white"
            href="/admin"
          >
            Admin
          </a>
        </header>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-blue/35 bg-blue/10 px-3 py-2 text-sm font-bold text-ice">
              <LockKeyhole size={16} />
              Validação privada em andamento
            </div>
            <h1 className="max-w-4xl text-5xl font-bold leading-[1.03] sm:text-6xl lg:text-7xl">
              Infraestrutura DeFi com experiência de fintech.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-silver">
              Aivor transforma um vault de USDC em uma experiência simples para
              acompanhar saldo, liquidez, governança e crescimento patrimonial,
              sem esconder que o produto opera sobre contratos e riscos DeFi.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button className="h-12">
                Entrar na comunidade
                <ArrowRight size={18} />
              </Button>
              <Button className="h-12" variant="secondary">
                Ver transparência
              </Button>
            </div>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-muted">
              Aivor não promete rendimento fixo. Estratégias são ativadas
              progressivamente conforme testes, governança, limites e auditoria.
            </p>
          </div>

          <div className="grid gap-4">
            <section className="rounded-lg border border-line bg-graphite/60 p-5 shadow-calm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-silver">Vault</p>
                  <h2 className="mt-1 text-2xl font-bold">Aivor Yield USDC</h2>
                </div>
                <div className="rounded-md border border-blue/40 bg-blue/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-ice">
                  ovUSDC
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {statuses.map(([label, value]) => (
                  <div className="rounded-md border border-line bg-ink/55 p-4" key={label}>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-silver">
                      {label}
                    </p>
                    <p className="mt-2 font-bold">{value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-blue/30 bg-blue/10 p-5 shadow-glow">
              <div className="flex items-start gap-4">
                <BarChart3 className="mt-1 text-azure" size={22} />
                <div>
                  <h2 className="text-xl font-bold">Ativação por risco</h2>
                  <p className="mt-3 leading-7 text-ice">
                    Core, estratégias e estratégias avançadas existem na
                    arquitetura, mas cada módulo progride por status:
                    documented, simulated, read_only, limited_capital e active.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-ink/50 px-5 py-14 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 xl:grid-cols-4">
          {pillars.map(({ title, text, icon: Icon }) => (
            <article className="rounded-lg border border-line bg-graphite/55 p-5" key={title}>
              <Icon className="text-blue" size={24} />
              <h2 className="mt-5 text-xl font-bold">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-silver">{text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
