"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";

export default function PrivyTokenDevPage() {
  const {
    authenticated,
    getAccessToken,
    login,
    logout,
    ready,
    user
  } = usePrivy();
  const [accessToken, setAccessToken] = useState("");
  const [error, setError] = useState("");

  const appIdConfigured = Boolean(process.env.NEXT_PUBLIC_PRIVY_APP_ID);

  async function loadTokens() {
    setError("");
    try {
      const [nextAccessToken, nextIdentityToken] = await Promise.all([
        getAccessToken(),
        Promise.resolve("")
      ]);
      setAccessToken(nextAccessToken ?? "");
      void nextIdentityToken;
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to load Privy tokens");
    }
  }

  return (
    <main className="min-h-screen bg-carbon px-4 py-6 text-white sm:px-8">
      <section className="mx-auto max-w-3xl rounded-lg border border-line bg-graphite/60 p-5 shadow-calm">
        <div className="mb-5">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-azure">
            Dev
          </p>
          <h1 className="mt-2 text-2xl font-bold">Privy Token</h1>
        </div>

        <div className="mb-5 grid gap-3 text-sm text-silver sm:grid-cols-3">
          <div className="rounded-md border border-line bg-ink/60 p-3">
            <p className="font-bold text-white">App ID</p>
            <p className="mt-1">{appIdConfigured ? "Configurado" : "Ausente"}</p>
          </div>
          <div className="rounded-md border border-line bg-ink/60 p-3">
            <p className="font-bold text-white">Privy</p>
            <p className="mt-1">{ready ? "Pronto" : "Carregando"}</p>
          </div>
          <div className="rounded-md border border-line bg-ink/60 p-3">
            <p className="font-bold text-white">Sessao</p>
            <p className="mt-1">{authenticated ? "Autenticada" : "Nao autenticada"}</p>
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <button
            className="rounded-md border border-blue/50 bg-blue px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!ready || !appIdConfigured}
            onClick={() => login()}
            type="button"
          >
            Login Privy
          </button>
          <button
            className="rounded-md border border-line bg-ink px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!ready || !authenticated}
            onClick={loadTokens}
            type="button"
          >
            Gerar tokens
          </button>
          <button
            className="rounded-md border border-line px-4 py-3 font-bold text-silver disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!ready || !authenticated}
            onClick={() => logout()}
            type="button"
          >
            Logout Privy
          </button>
        </div>

        {error ? (
          <div className="mb-5 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <div className="space-y-4">
          <TokenBox label="Access token" value={accessToken} />
          <TokenBox label="POST /auth/login body" value={buildLoginBody(accessToken, user)} />
          <TokenBox label="Privy user" value={user ? JSON.stringify(user, null, 2) : ""} />
        </div>
      </section>
    </main>
  );
}

function buildLoginBody(accessToken: string, user: unknown) {
  if (!accessToken) return "";
  const walletAddress = getPrimaryWalletAddress(user);

  return JSON.stringify(
    {
      accessToken,
      ...(walletAddress ? { walletAddress, chainId: 8453 } : {})
    },
    null,
    2
  );
}

function getPrimaryWalletAddress(user: unknown) {
  const linkedAccounts = (user as { linkedAccounts?: Array<Record<string, unknown>> } | null)?.linkedAccounts;
  const wallet = linkedAccounts?.find((account) => {
    return (
      (account.type === "wallet" || account.type === "smart_wallet") &&
      typeof account.address === "string" &&
      /^0x[0-9a-fA-F]{40}$/.test(account.address)
    );
  });

  return typeof wallet?.address === "string" ? wallet.address : null;
}

function TokenBox({ label, value }: { label: string; value: string }) {
  async function copy() {
    if (!value) return;
    await navigator.clipboard.writeText(value);
  }

  return (
    <div className="rounded-md border border-line bg-ink/60 p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="font-bold">{label}</p>
        <button
          className="rounded-md border border-line px-3 py-1 text-sm font-bold text-azure disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!value}
          onClick={copy}
          type="button"
        >
          Copiar
        </button>
      </div>
      <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-all rounded-md bg-carbon p-3 text-xs text-ice">
        {value || "Ainda nao gerado"}
      </pre>
    </div>
  );
}
