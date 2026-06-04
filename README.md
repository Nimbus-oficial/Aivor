# Aivor

Aivor is a premium Web3 fintech experience that turns DeFi infrastructure into a simple USDC yield account.

The user experience must feel like a modern digital bank: clear balance, visible growth, instant withdrawal intent, and no blockchain jargon in the core product surface.

## Architecture

- `apps/web`: Next.js app for the Aivor customer experience.
- `apps/backend`: NestJS API for auth, users, analytics, notifications, AI support, security, and observability.
- `packages/ui`: shared UI primitives.
- `packages/types`: shared TypeScript contracts.
- `packages/config`: shared configuration helpers.
- `packages/sdk`: app-facing SDK for vault data and actions.
- `contracts`: Solidity/Foundry vault system.

## Product Rules

- Users never see shares, ERC4626 internals, yield farming, staking, or protocol complexity.
- The internal vault token is a non-rebasing ERC4626-style yield-bearing share token.
- Technical share token: `ovUSDC`.
- Technical share name: `Orvex Yield USDC`.
- User value grows through share price appreciation: initially `1 ovUSDC = 1 USDC`; with yield, `1 ovUSDC > 1 USDC`.
- Backend never controls funds.
- Admins cannot withdraw user funds arbitrarily.
- Smart contracts start non-upgradeable and prioritize safety.
- MVP excludes NFTs, DAO, gamification, cards, multi-chain, copy trading, and trading.

## Admin Architecture

Aivor follows a limited admin panel plus secure contracts model:

`Admin Panel -> OrvexController.sol -> OrvexVault.sol -> Morpho Markets`

The admin panel is operational only. It can propose and execute authorized strategy changes, rebalance within contract limits, monitor vault state, and trigger emergency protections through Safe multisig and timelock rules. It must never custody funds, alter user shares, transfer user balances, or manually change user wealth.

Critical operations are designed for Safe multisig, starting with the approved 2-of-4 policy. Strategy and vault configuration changes use timelock review windows. Emergency pause remains available for fast protection, while funds continue to move only through smart contracts.

## Brand System

- Primary font direction: Grotesk/Helvetica.
- Core colors: `#15181A`, `#222529`, `#383B3E`, `#6F7174`, `#9C9D9F`, `#FFFFFF`.
- Accent colors: `#2973FF`, `#5792FF`, `#C4DAFF`.
