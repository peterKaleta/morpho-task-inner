# Morpho Market Watchlists

## Problem

Morpho has a growing set of markets across assets and chains. For curators, analysts, and power users, the first step is often not a transaction; it is deciding which markets deserve attention.

## Solution

The app provides a lightweight watchlist workflow on top of the Morpho API. Users can browse a basic market table, open a market detail page, sign in with a wallet, and save markets into named watchlists. The backend enriches user-owned watchlist data with fresh Morpho market metrics, while server-side caching reduces repeated API calls and keeps the UI responsive.

## Target User And Scope

The target user is a Morpho ecosystem participant who evaluates markets: an allocator, curator, integrator, analyst, or advanced user. The V1 scope is intentionally narrow: markets only, no vaults, no wallet position tracking, and no transaction actions. The app focuses on a simple workflow: browse markets, save markets to lists, and review saved markets later.

## Why It Is Valuable To Morpho

This app turns Morpho API data into a practical research and monitoring workflow. It also creates a foundation for richer ecosystem tooling: watchlists can later become the starting point for vault analysis, allocation review, alerts, or portfolio-aware market monitoring. For Morpho, this kind of tool - if developed further - would help make market data easier to act on. It supports users who need to compare opportunities before deploying capital or building integrations, and it shows a clear fullstack pattern for composing Morpho API data with user-specific application data.

## How I Would Improve It With More Time in V2

With more time, I would make watchlists more analytical rather than only organizational. A watchlist could summarize its saved markets with aggregate liquidity, utilization ranges, APY comparisons, LLTV distribution, and change indicators. I would also add watchlist-level alerts so users can monitor conditions like liquidity dropping below a threshold, utilization moving sharply, or APY changing materially.

I would also make watchlists part of the broader market discovery workflow. The main market table could support filtering by existing watchlists, public watchlists could let users share curated market sets, and the same model could extend beyond markets to vaults and eventually other user-specific Morpho entities. Those additions are out of scope for V1 so the initial build can stay focused on a reliable market organization workflow.

For a V2 technical evolution, I would split the backend into a dedicated NestJS service instead of keeping backend routes inside the Next.js app. I would also autogenerate REST API types from the backend contract so the frontend API client stays type-safe without hand-maintained request and response shapes.
