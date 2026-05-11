"use client";

import Link from "next/link";
import { BookmarkPlus, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

import {
  useMarketQuery,
  useMyWatchlistsQuery,
  type Market,
  type WatchlistSummary,
} from "@pk-task/api/data";
import { Button } from "@pk-task/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@pk-task/ui/components/card";

import {
  formatAssetAmount,
  formatLltv,
  formatMarketPair,
  formatPercent,
} from "./formatters";
import { AddToWatchlistDialog } from "@/features/watchlists/add-to-watchlist-dialog";
import { useSession } from "@/providers/session-provider";

export function MarketDetailClient({ marketId }: { marketId: string }) {
  const marketQuery = useMarketQuery(marketId);
  const market = marketQuery.data?.market ?? null;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/markets">Back to markets</Link>
      </Button>

      {marketQuery.isPending ? (
        <MarketDetailSkeleton marketId={marketId} />
      ) : marketQuery.isError ? (
        <MarketState
          title="Market could not load"
          description="Morpho market data is unavailable right now."
          action={
            <Button onClick={() => void marketQuery.refetch()}>
              <RefreshCw className="size-4" aria-hidden="true" />
              Retry
            </Button>
          }
        />
      ) : !market ? (
        <MarketState
          title="Market not found"
          description="Morpho did not return a market for this identifier."
        />
      ) : (
        <MarketDetailCard market={market} />
      )}
    </div>
  );
}

function MarketDetailCard({ market }: { market: Market }) {
  const marketLabel = formatMarketPair(
    market.loanAsset?.symbol,
    market.collateralAsset?.symbol,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{marketLabel}</CardTitle>
        <CardDescription className="break-all">
          {market.marketId}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Metric label="Chain" value={market.chain?.network ?? "Unknown"} />
          <Metric
            label="Supply APY"
            value={formatPercent(market.state?.supplyApy)}
          />
          <Metric
            label="Borrow APY"
            value={formatPercent(market.state?.borrowApy)}
          />
          <Metric label="LLTV" value={formatLltv(market.lltv)} />
          <Metric
            label="Total market size"
            value={formatAssetAmount(
              market.state?.totalMarketSize,
              market.loanAsset?.decimals,
              market.loanAsset?.symbol,
            )}
          />
          <Metric
            label="Total liquidity"
            value={formatAssetAmount(
              market.state?.totalLiquidity,
              market.loanAsset?.decimals,
              market.loanAsset?.symbol,
            )}
          />
        </div>
        <MarketWatchlistsSection market={market} marketLabel={marketLabel} />
      </CardContent>
    </Card>
  );
}

function MarketWatchlistsSection({
  market,
  marketLabel,
}: {
  market: Market;
  marketLabel: string;
}) {
  const session = useSession();
  const isSignedIn = session.status === "signed-in";
  const watchlistsQuery = useMyWatchlistsQuery({ enabled: isSignedIn });
  const currentWatchlists =
    watchlistsQuery.data?.myWatchlists.filter((watchlist) =>
      watchlist.marketUniqueKeys.includes(market.marketId),
    ) ?? [];

  return (
    <section className="space-y-4 border-t pt-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-medium">Watchlists</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Lists containing this market.
          </p>
        </div>
        <AddToWatchlistDialog
          marketId={market.marketId}
          marketLabel={marketLabel}
        >
          <Button size="sm">
            <BookmarkPlus className="size-4" aria-hidden="true" />
            Add to watchlist
          </Button>
        </AddToWatchlistDialog>
      </div>

      {session.status === "loading" ? (
        <div className="bg-muted h-12 animate-pulse rounded-md" />
      ) : !isSignedIn ? (
        <p className="text-muted-foreground rounded-md border border-dashed p-4 text-sm">
          Sign in to see watchlists containing this market.
        </p>
      ) : watchlistsQuery.isPending ? (
        <div className="bg-muted h-12 animate-pulse rounded-md" />
      ) : watchlistsQuery.isError ? (
        <div className="flex items-center justify-between gap-3 rounded-md border border-dashed p-4">
          <p className="text-muted-foreground text-sm">
            Watchlists could not load.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void watchlistsQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : currentWatchlists.length === 0 ? (
        <p className="text-muted-foreground rounded-md border border-dashed p-4 text-sm">
          This market is not in any watchlists yet.
        </p>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-md border">
          {currentWatchlists.map((watchlist) => (
            <MarketWatchlistRow key={watchlist.id} watchlist={watchlist} />
          ))}
        </div>
      )}
    </section>
  );
}

function MarketWatchlistRow({
  watchlist,
}: {
  watchlist: WatchlistSummary;
}) {
  return (
    <Link
      href={`/watchlists/${encodeURIComponent(watchlist.id)}`}
      className="hover:bg-muted/50 block p-3 transition-colors"
    >
      <p className="truncate text-sm font-medium">{watchlist.name}</p>
      <p className="text-muted-foreground mt-1 text-xs">
        {watchlist.itemCount} markets
      </p>
    </Link>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background rounded-md border p-4">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="mt-1 break-words font-medium">{value}</p>
    </div>
  );
}

function MarketDetailSkeleton({ marketId }: { marketId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Market detail</CardTitle>
        <CardDescription className="break-all">{marketId}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-muted h-24 animate-pulse rounded-md"
              aria-hidden="true"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MarketState({
  action,
  description,
  title,
}: {
  action?: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-md border border-dashed p-6 text-center">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      </div>
      {action}
    </div>
  );
}
