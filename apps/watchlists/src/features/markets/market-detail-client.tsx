"use client";

import Link from "next/link";
import { BookmarkPlus, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

import { useMarketQuery, type Market } from "@pk-task/api/data";
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {formatMarketPair(
            market.loanAsset?.symbol,
            market.collateralAsset?.symbol,
          )}
        </CardTitle>
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
        <AddToWatchlistDialog
          marketId={market.marketId}
          marketLabel={formatMarketPair(
            market.loanAsset?.symbol,
            market.collateralAsset?.symbol,
          )}
        >
          <Button>
            <BookmarkPlus className="size-4" aria-hidden="true" />
            Add to watchlist
          </Button>
        </AddToWatchlistDialog>
      </CardContent>
    </Card>
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
