# Task - Peter Kaleta - Morpho Market Watchlists

## Table of contents

- [General Overview](#general-overview)
  - [Summary & Artifacts](#summary--artifacts)
  - [What Is Included](#what-is-included)
  - [Suggested Follow-Ups](#suggested-follow-ups)
## Tech Stack & Data Flow
  - [Tech Stack](#tech-stack)
  - [Repository Structure](#repository-structure)
  - [Architecture](#architecture)
- [Local Dev & Setup](#local-dev--setup)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Install](#install)
  - [Work Locally](#work-locally)
  - [Useful Scripts](#useful-scripts)
- [Testing](#testing)

## General Overview

### Summary & Artifacts

Morpho Market Watchlists is a small fullstack app for creating market watchlists. Users can browse live Morpho market data, sign in with a wallet, create named watchlists, and save markets into those lists so they can compare opportunities or revisit markets later.

Given the 5 hour limit. I've made a point of focusing on the architecture, key building blocks (apps separated from packages; testing; extracted api package etc.) and the shape of the repo. I've spent less time on the   operational-task level craft and killer UX. At the end of this section I'm adding a list of followups I would put my time into given this was actual feature/app to build.

The app can be accessed [live on vercel](https://morpho-task-inner-watchlists.vercel.app/) or started locally as a part of a dockerised en (instructions later in the readme).

App & docs
- [Vercel app: https://morpho-task-inner-watchlists.vercel.app/](https://morpho-task-inner-watchlists.vercel.app/)
- [Business case docs](docs/BusinessCase.md)
- Architecture:
![Architecture](docs/architecture.jpeg)

### What Is Included

- Next.js App Router web app for market browsing and watchlist management.
- REST auth routes for wallet nonce creation, signature verification, logout, and current-user lookup.
- GraphQL Yoga endpoint for markets, market details, watchlists, and watchlist mutations. Combined baed on the local database (watchlists) and Morpho API.
- Drizzle/Postgres persistence for users, auth nonces, watchlists, and watchlist items.
- Redis-backed caching for Morpho API market responses, with graceful fallback to direct Morpho calls.
- Shared frontend API hooks, shared UI primitives, and shared text/env helpers in workspace packages.
- Unit and endpoint tests using Vitest.

### Suggested Follow-Ups

#### Functional
- Add market filtering and sorting beyond the V1 free-text search.
- Add vault support and show which vaults allocate into watched markets.
- Add alerts for market metrics such as liquidity, utilization, APY, or LLTV changes.
- Add historical charts and deeper market analytics.
- Add observability for production errors and cache behavior.

#### Technical
- Split the backend into a dedicated package (probably nest.js)
- Move Graphql, error handling and other streamlinable architectural tasks into 3rd party nest plugins and decorators
- Materialized views for future analytics data
- Have a single connector to redis (rn we areswitching between local docker-redis and upstash redis which require different connection approaches)
- Review components for: memoisation, proper data boundaries, reusability etc.
- Come up with sleaker UX based on: 
  - optimistic updates
  - minimal re-render boundaries

## Tech Stack & Data Flow

### Tech Stack

- TypeScript
- Next.js App Router
- React
- Tailwind CSS
- shadcn/ui
- GraphQL Yoga
- Drizzle ORM
- Postgres
- Redis / Upstash Redis
- wagmi, viem, and ConnectKit
- TanStack Query
- gql.tada and urql
- Vitest
- pnpm workspaces

### Repository Structure

```text
.
├── apps/
│   └── watchlists/
│       ├── src/
│       │   ├── app/                         Next.js App Router pages, layouts, and route handlers
│       │   │   ├── api/
│       │   │   │   ├── auth/                REST wallet auth routes: nonce, verify, logout, me
│       │   │   │   └── graphql/             GraphQL Yoga endpoint
│       │   │   ├── markets/                 Market list and market detail routes
│       │   │   └── watchlists/              Watchlist index and watchlist detail routes
│       │   ├── features/
│       │   │   ├── markets/                 Market UI components and formatting helpers
│       │   │   └── watchlists/              Watchlist UI components, forms, dialogs, and states
│       │   ├── providers/                   Wallet auth and TanStack Query providers
│       │   └── server/
│       │       ├── cache/                    Redis cache wrappers
│       │       ├── graphql/                 Yoga schema, resolvers, context, and error mapping
│       │       └── services/
│       │           ├── auth/                 Nonces, signed cookie sessions, validation, current user
│       │           ├── markets/              Morpho API client, query documents, market services, cache policy
│       │           └── watchlists/           Watchlist validation, repository, and service logic
│       ├── config-client.ts                  Public client env validation
│       ├── config-server.ts                  Server env validation and env file loading
│       └── package.json
├── packages/
│   ├── api/                                  Shared frontend API clients, documents, hooks, query keys
│   ├── db/                                   Drizzle schema, client, migrations, config, health check
│   ├── shared/                               Shared helpers used across workspace boundaries
│   └── ui/                                   Shared shadcn/ui components, hooks, and utilities
├── docs/                                     Architecture diagram and product/business documentation
├── docker-compose.yml                        Local Postgres and Redis services
├── pnpm-workspace.yaml                       Workspace package definitions
└── package.json                              Root scripts for dev, build, lint, test, typecheck, db tasks
```

### Data Flow through the architecture

The app keeps user-specific data and public market data separate:

- Postgres stores users, auth nonces, watchlists, and watchlist items.
- Morpho market data is fetched from the Morpho GraphQL API through a backend service layer.
- Redis caches Morpho market list/detail responses only; it does not cache user watchlist data.
- GraphQL resolvers compose persisted watchlist data with fresh or cached Morpho market data.
- Wallet auth is handled through REST routes because those flows need nonce validation and HTTP-only cookie session handling.

## Local Dev & Setup

### Prerequisites

- Node.js compatible with the installed Next.js version.
- pnpm `10.11.0`.
- Docker, if you want to run local Postgres and Redis through `docker-compose.yml`.

### Environment Setup

Copy the example env files before running the app locally:

```bash
cp apps/watchlists/.env.example apps/watchlists/.env.local
cp packages/db/.env.example packages/db/.env
```

The default local database and Redis values match `docker-compose.yml`:

```bash
DATABASE_URL="postgres://morpho:morpho@localhost:5432/morpho_watchlists"
REDIS_URL="redis://localhost:6379"
MORPHO_API_URL="https://api.morpho.org/graphql"
SESSION_SECRET="replace-with-at-least-32-random-characters"
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=""
```

For production on Vercel, use Neon Postgres and Upstash Redis or equivalent managed services. Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` when using Upstash REST caching.

### Install

```bash
pnpm install
```

### Work Locally

Start local infrastructure:

```bash
docker compose up -d
```

Apply database migrations:

```bash
pnpm db:migrate
```

Optionally verify the database connection:

```bash
pnpm db:check
```

Start the development server:

```bash
pnpm dev
```

The app runs through the `@pk-task/watchlists` workspace. By default, Next.js serves it at `http://localhost:3000`.

### Useful Scripts

```bash
pnpm dev        # run the watchlists app locally
pnpm build      # build the watchlists app
pnpm lint       # lint the watchlists app
pnpm typecheck  # typecheck all workspace packages
pnpm test       # run all workspace tests
pnpm db:migrate # apply Drizzle migrations
pnpm db:check   # verify database connectivity
```

## Testing & Deployment

### Testing

The test approach is intentionally focused on backend contracts and shared package safety rather than full browser E2E coverage.

- `apps/watchlists` uses Vitest for route-handler, service, auth-session, Morpho client, Redis cache, and GraphQL endpoint tests.
- GraphQL endpoint tests exercise the `/api/graphql` route with mocked auth, Morpho, and watchlist services so resolver behavior is checked without relying on external APIs.
- Auth route tests cover nonce, verify, logout, and current-user response behavior at the route boundary.
- Service tests cover domain behavior such as wallet session handling, watchlist errors, Morpho response mapping, cache hit/miss behavior, and Redis bypass paths.
- Workspace typechecks keep app, API, DB, shared, and UI package contracts aligned.
- `pnpm build` is used as the production integration check for Next.js routing, server/client boundaries, and Vercel-style bundling.

Run the full test suite:

```bash
pnpm test
```

Run type checks:

```bash
pnpm typecheck
```

Run linting:

```bash
pnpm lint
```

Run the production build check:

```bash
pnpm build
```

Before submitting changes, run all four:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
