# Aivor

Aivor is a Web3 fintech project focused on making DeFi vault infrastructure easier to understand, monitor, and operate.

The current product direction is a modular Aivor V1 with progressive activation by risk. The core path under private validation is:

`USDC -> Aivor Vault -> Morpho Allocator -> Morpho -> Aivor Vault -> USDC`

This repository is not a public launch, production release, or invitation to deposit funds.

## Current Status

- Brand: Aivor, official handle `@aivorlabs`.
- Vault token: `Aivor Yield USDC`.
- Technical ticker: `ovUSDC`.
- Model: non-rebasing ERC4626 yield-bearing shares.
- Network used for private validation: Base Mainnet.
- Governance model: Safe + timelock, production policy remains 2-of-4.
- Backend: non-custodial operational layer.
- Database: operational/audit layer, not the final financial source.
- Final financial source: blockchain.

The project is currently waiting for a timelock window before the next private Morpho validation step. Do not treat any private validation contracts or development wallets as production infrastructure.

## Repository Structure

- `apps/web`: public web experience and admin panel.
- `apps/backend`: NestJS API for auth, operations, observability, governance, Morpho read-only data, and audit flows.
- `packages/ui`: shared UI primitives.
- `packages/types`: shared TypeScript contracts.
- `packages/sdk`: frontend-facing SDK with safe fallbacks.
- `packages/config`: shared configuration helpers.
- `contracts`: Solidity and Foundry contracts/scripts/tests.
- `Aivor.organização`: official project vault and documentation source.

## Product Principles

- Backend never custodies user funds.
- The database is not the final source of financial truth.
- Smart contracts control deposits, withdrawals, allocation, and accounting.
- Admin flows must respect Safe, timelock, roles, limits, and auditability.
- Public UX should explain Aivor without hiding DeFi risk.
- No fixed yield promise.

## Local Development

Install dependencies:

```powershell
npm.cmd install
```

Run the web app:

```powershell
npm.cmd run dev --workspace @orvex/web
```

Run the backend:

```powershell
npm.cmd run start:dev --workspace @orvex/backend
```

Run backend build and schema tests:

```powershell
npm.cmd run build --workspace @orvex/backend
npm.cmd run test --workspace @orvex/backend
```

Run typechecks:

```powershell
npm.cmd run typecheck --workspace @orvex/types
npm.cmd run typecheck --workspace @orvex/sdk
npm.cmd run typecheck --workspace @orvex/web
```

Run contracts:

```powershell
forge build
forge test
```

## Environment

Use `.env.example` files as references. Do not commit `.env`, private keys, database URLs, Foundry cache, or sensitive broadcast artifacts.

Important technical env names still use legacy `ORVEX_*` and `@orvex/*` package names for compatibility. These are intentional technical legacy identifiers and do not change the public brand.

## Security And Risk

Aivor is not production-ready until:

- production wallets and credentials are rotated;
- production Safe uses official signers;
- Safe policy matches 2-of-4;
- timelock operations are validated;
- Morpho capital movement is validated with minimum capital;
- external audit is completed;
- public onboarding and risk disclosures are approved.

## Roadmap

1. Complete timelock execution for the private Morpho validation.
2. Validate 1 USDC allocation and withdrawal through Morpho.
3. Strengthen allocator monitoring, rollback, and emergency flows.
4. Expand admin panel with real operational data.
5. Keep Aave, Uniswap, Aerodrome, Looping, and Leverage inactive until their dedicated validation phases.

