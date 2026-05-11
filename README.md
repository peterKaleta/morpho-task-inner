# Morpho Market Watchlists

![Architecture](docs/architecture.jpeg)

[Vercel deployment placeholder](https://your-vercel-deployment-url.vercel.app)

Morpho Market Watchlists is a small fullstack app for organizing and monitoring Morpho markets. Users can browse live Morpho market data, sign in with a wallet, create named watchlists, and save markets into those lists so they can compare opportunities or revisit markets later.

The V1 scope is intentionally focused: market browsing, wallet-based authentication, user-owned watchlists, and saved market comparison. It does not include vault browsing, onchain transactions, portfolio tracking, or complex risk scoring.

## What Is Included

- Next.js App Router web app for market browsing and watchlist management.
- REST auth routes for wallet nonce creation, signature verification, logout, and current-user lookup.
- GraphQL Yoga endpoint for markets, market details, watchlists, and watchlist mutations.
- Drizzle/Postgres persistence for users, auth nonces, watchlists, and watchlist items.
- Redis-backed caching for Morpho API market responses, with graceful fallback to direct Morpho calls.
- Shared frontend API hooks, shared UI primitives, and shared text/env helpers in workspace packages.
- Unit and endpoint tests using Vitest.

## Repository Structure

- `apps/watchlists`: Next.js application containing the frontend, REST auth route handlers, GraphQL endpoint, and server-side feature modules.
- `apps/watchlists/src/app`: App Router pages, layouts, loading states, error boundaries, and API route handlers.
- `apps/watchlists/src/app/api/auth`: REST wallet auth routes for nonce, verify, logout, and current user.
- `apps/watchlists/src/app/api/graphql`: GraphQL Yoga route handler.
- `apps/watchlists/src/app/markets`: market list and market detail routes.
- `apps/watchlists/src/app/watchlists`: watchlist index and watchlist detail routes.
- `apps/watchlists/src/features/markets`: market UI components and formatting helpers.
- `apps/watchlists/src/features/watchlists`: watchlist UI components, forms, dialogs, and states.
- `apps/watchlists/src/providers`: app-level React providers for wallet auth and TanStack Query.
- `apps/watchlists/src/server/graphql`: Yoga schema, resolvers, context creation, and GraphQL error mapping.
- `apps/watchlists/src/server/services/auth`: wallet nonce verification, signed cookie session helpers, validation, and current-user lookup.
- `apps/watchlists/src/server/services/markets`: typed Morpho API client, upstream query documents, and app-facing market service methods.
- `apps/watchlists/src/server/services/watchlists`: watchlist validation, repository, and service logic.
- `apps/watchlists/src/server/cache`: Redis cache wrappers and cache key helpers.
- `packages/api`: shared frontend API package for REST auth hooks, GraphQL documents, clients, query keys, and TanStack Query hooks.
- `packages/db`: Drizzle schema, database client, migrations, config, and database health check.
- `packages/shared`: shared helpers used across app and package boundaries.
- `packages/ui`: shared shadcn/ui components, hooks, and UI utilities.
- `docs`: architecture diagram and product/business documentation.
- `docker-compose.yml`: local Postgres and Redis services for development.

## Architecture

The app keeps user-specific data and public market data separate:

- Postgres stores users, auth nonces, watchlists, and watchlist items.
- Morpho market data is fetched from the Morpho GraphQL API through a backend service layer.
- Redis caches Morpho market list/detail responses only; it does not cache user watchlist data.
- GraphQL resolvers compose persisted watchlist data with fresh or cached Morpho market data.
- Wallet auth is handled through REST routes because those flows need nonce validation and HTTP-only cookie session handling.

## Tech Stack

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

## Prerequisites

- Node.js compatible with the installed Next.js version.
- pnpm `10.11.0`.
- Docker, if you want to run local Postgres and Redis through `docker-compose.yml`.

## Environment Setup

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

## Install

```bash
pnpm install
```

## Work Locally

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

## Useful Scripts

```bash
pnpm dev        # run the watchlists app locally
pnpm build      # build the watchlists app
pnpm lint       # lint the watchlists app
pnpm typecheck  # typecheck all workspace packages
pnpm test       # run all workspace tests
pnpm db:migrate # apply Drizzle migrations
pnpm db:check   # verify database connectivity
```

## Testing

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

Before submitting changes, run all three:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

## Deployment

The app is intended to deploy to Vercel.

1. Create managed Postgres and Redis services, for example Neon and Upstash.
2. Add the production environment variables in Vercel.
3. Set the Vercel project to build from this repository.
4. Use `pnpm build` as the build command.
5. Replace the deployment placeholder at the top of this README with the real Vercel URL.

## Suggested Follow-Ups

- Add market filtering and sorting beyond the V1 free-text search.
- Add vault support and show which vaults allocate into watched markets.
- Add alerts for market metrics such as liquidity, utilization, APY, or LLTV changes.
- Add historical charts and deeper market analytics.
- Add observability for production errors and cache behavior.
- Split the backend into a dedicated service if the app grows beyond the task scope.

