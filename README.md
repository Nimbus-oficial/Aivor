# Orvex

Orvex is a premium Web3 fintech experience that turns DeFi infrastructure into a simple USDC yield account.

The user experience must feel like a modern digital bank: clear balance, visible growth, instant withdrawal intent, and no blockchain jargon in the core product surface.

## Architecture

- `apps/web`: Next.js app for the Orvex customer experience.
- `apps/backend`: NestJS API for auth, users, analytics, notifications, AI support, security, and observability.
- `packages/ui`: shared UI primitives.
- `packages/types`: shared TypeScript contracts.
- `packages/config`: shared configuration helpers.
- `packages/sdk`: app-facing SDK for vault data and actions.
- `contracts`: Solidity/Foundry vault system.

## Product Rules

- Users never see shares, ERC4626 internals, yield farming, staking, or protocol complexity.
- Backend never controls funds.
- Admins cannot withdraw user funds arbitrarily.
- Smart contracts start non-upgradeable and prioritize safety.
- MVP excludes NFTs, DAO, gamification, cards, multi-chain, copy trading, and trading.
