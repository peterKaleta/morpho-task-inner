"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BookmarkPlus,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import {
  MARKETS_PAGE_SIZE,
  useMarketsQuery,
  type Market,
} from "@pk-task/api/data";
import { Button } from "@pk-task/ui/components/button";
import {
  Card,
  CardContent,
} from "@pk-task/ui/components/card";
import { Input } from "@pk-task/ui/components/input";
import { AddToWatchlistDialog } from "@/features/watchlists/add-to-watchlist-dialog";

import {
  formatAssetAmount,
  formatLltv,
  formatMarketPair,
  formatPercent,
} from "./formatters";

export function MarketsPageClient() {
  const [pageIndex, setPageIndex] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPageIndex(0);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const marketsQuery = useMarketsQuery({ page: pageIndex, search });
  const markets = marketsQuery.data?.markets ?? [];
  const hasSearch = search.length > 0;
  const canGoNext = markets.length === MARKETS_PAGE_SIZE;
  const canGoPrevious = pageIndex > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal">Markets</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
            Browse live Morpho markets and open a market for deeper context.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          {marketsQuery.isPending ? (
            <MarketTableSkeleton />
          ) : marketsQuery.isError ? (
            <MarketState
              title="Markets could not load"
              description="Morpho market data is unavailable right now."
              action={
                <Button onClick={() => void marketsQuery.refetch()}>
                  <RefreshCw className="size-4" aria-hidden="true" />
                  Retry
                </Button>
              }
            />
          ) : markets.length === 0 ? (
            <MarketState
              title={
                pageIndex > 0
                  ? "No more markets"
                  : hasSearch
                    ? "No markets match your search"
                    : "No markets"
              }
              description={
                pageIndex > 0
                  ? "Go back to the previous page to continue browsing."
                  : hasSearch
                    ? "Try a different asset, chain, or market identifier."
                    : "Morpho did not return markets for the default list."
              }
              action={
                pageIndex > 0 ? (
                  <Button
                    variant="outline"
                    onClick={() =>
                      setPageIndex((page) => Math.max(0, page - 1))
                    }
                  >
                    <ChevronLeft className="size-4" aria-hidden="true" />
                    Previous page
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="space-y-4">
              <MarketTableToolbar
                canGoNext={canGoNext}
                canGoPrevious={canGoPrevious}
                isLoading={marketsQuery.isFetching}
                onSearchChange={setSearchInput}
                pageIndex={pageIndex}
                searchInput={searchInput}
                onNext={() => setPageIndex((page) => page + 1)}
                onPrevious={() => setPageIndex((page) => Math.max(0, page - 1))}
              />
              <MarketTable markets={markets} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MarketTableToolbar({
  canGoNext,
  canGoPrevious,
  isLoading,
  onNext,
  onPrevious,
  onSearchChange,
  pageIndex,
  searchInput,
}: {
  canGoNext: boolean;
  canGoPrevious: boolean;
  isLoading: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSearchChange: (value: string) => void;
  pageIndex: number;
  searchInput: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:w-80">
        <Search className="text-muted-foreground pointer-events-none absolute left-3 top-2.5 size-4" />
        <Input
          value={searchInput}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search markets"
          className="pl-9"
          aria-label="Search markets"
        />
      </div>
      <div className="flex items-center gap-2">
        <p className="text-muted-foreground mr-2 hidden text-sm sm:block">
          Page {pageIndex + 1} - {MARKETS_PAGE_SIZE} markets
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={!canGoPrevious || isLoading}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!canGoNext || isLoading}
        >
          Next
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

function MarketTable({ markets }: { markets: Market[] }) {
  return (
    <div className="max-h-[calc(100dvh-23rem-100px)] min-h-72 overflow-auto rounded-md border">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="bg-muted text-muted-foreground sticky top-0 z-10 text-left">
          <tr>
            <th className="p-3 font-medium">Market</th>
            <th className="p-3 font-medium">Chain</th>
            <th className="p-3 font-medium">Supply APY</th>
            <th className="p-3 font-medium">Borrow APY</th>
            <th className="p-3 font-medium">LLTV</th>
            <th className="p-3 font-medium">Market Size</th>
            <th className="p-3 font-medium">Liquidity</th>
            <th className="p-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {markets.map((market) => (
            <tr key={market.marketId} className="bg-card border-t">
              <td className="p-3">
                <div className="font-medium">
                  {formatMarketPair(
                    market.loanAsset?.symbol,
                    market.collateralAsset?.symbol,
                  )}
                </div>
                <div className="text-muted-foreground max-w-64 truncate text-xs">
                  {market.marketId}
                </div>
              </td>
              <td className="p-3">{market.chain?.network ?? "Unknown"}</td>
              <td className="p-3">
                {formatPercent(market.state?.supplyApy)}
              </td>
              <td className="p-3">
                {formatPercent(market.state?.borrowApy)}
              </td>
              <td className="p-3">{formatLltv(market.lltv)}</td>
              <td className="p-3">
                {formatAssetAmount(
                  market.state?.totalMarketSize,
                  market.loanAsset?.decimals,
                  market.loanAsset?.symbol,
                )}
              </td>
              <td className="p-3">
                {formatAssetAmount(
                  market.state?.totalLiquidity,
                  market.loanAsset?.decimals,
                  market.loanAsset?.symbol,
                )}
              </td>
              <td className="p-3 text-right">
                <div className="flex justify-end gap-1">
                  <AddToWatchlistDialog
                    marketId={market.marketId}
                    marketLabel={formatMarketPair(
                      market.loanAsset?.symbol,
                      market.collateralAsset?.symbol,
                    )}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Manage watchlists for ${market.marketId}. Saved in ${
                        market.watchlistCount
                      } watchlists.`}
                    >
                      <BookmarkPlus className="size-4" aria-hidden="true" />
                      <span>{market.watchlistCount}</span>
                    </Button>
                  </AddToWatchlistDialog>
                  <Button asChild variant="ghost" size="icon">
                    <Link
                      href={`/markets/${encodeURIComponent(market.marketId)}`}
                      aria-label={`Open ${market.marketId}`}
                    >
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MarketTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="bg-muted h-12 animate-pulse rounded-md"
          aria-hidden="true"
        />
      ))}
    </div>
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
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-md border border-dashed p-6 text-center">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      </div>
      {action}
    </div>
  );
}
