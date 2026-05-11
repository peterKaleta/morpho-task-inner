"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Pencil, RefreshCw, Trash2, X } from "lucide-react";

import { useWatchlistQuery, type WatchlistItem } from "@pk-task/api/data";
import { Button } from "@pk-task/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@pk-task/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@pk-task/ui/components/table";

import {
  formatAssetAmount,
  formatLltv,
  formatMarketPair,
  formatPercent,
} from "@/features/markets/formatters";
import { useSession } from "@/providers/session-provider";
import { AuthButtons } from "@/features/auth/auth-buttons";

import { DeleteWatchlistDialog } from "./delete-watchlist-dialog";
import { RemoveWatchlistItemDialog } from "./remove-watchlist-item-dialog";
import { WatchlistFormDialog } from "./watchlist-form-dialog";
import { WatchlistSkeleton, WatchlistState } from "./watchlist-states";

export function WatchlistDetailClient({ watchlistId }: { watchlistId: string }) {
  const router = useRouter();
  const session = useSession();
  const isSignedIn = session.status === "signed-in";
  const watchlistQuery = useWatchlistQuery(watchlistId, { enabled: isSignedIn });
  const watchlist = watchlistQuery.data?.watchlist ?? null;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/watchlists">
          <ChevronLeft className="size-4" aria-hidden="true" />
          Back to watchlists
        </Link>
      </Button>

      {session.status === "loading" ? (
        <WatchlistSkeleton />
      ) : !isSignedIn ? (
        <WatchlistState
          title="Sign in to view this watchlist"
          description="Connect your wallet and sign in from the header to manage saved markets."
          action={<AuthButtons />}
        />
      ) : watchlistQuery.isPending ? (
        <WatchlistSkeleton />
      ) : watchlistQuery.isError ? (
        <WatchlistState
          title="Watchlist could not load"
          description="Your saved markets are unavailable right now."
          action={
            <Button onClick={() => void watchlistQuery.refetch()}>
              <RefreshCw className="size-4" aria-hidden="true" />
              Retry
            </Button>
          }
        />
      ) : !watchlist ? (
        <WatchlistState
          title="Watchlist not found"
          description="This list may have been deleted or belongs to another wallet."
        />
      ) : (
        <>
          <Card>
            <CardHeader className="space-y-3">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <CardTitle className="text-2xl">{watchlist.name}</CardTitle>
                  <CardDescription className="mt-2">
                    {watchlist.description || "No description"}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <WatchlistFormDialog watchlist={watchlist}>
                    <Button variant="outline" size="sm">
                      <Pencil className="size-4" aria-hidden="true" />
                      Edit
                    </Button>
                  </WatchlistFormDialog>
                  <DeleteWatchlistDialog
                    watchlistId={watchlist.id}
                    name={watchlist.name}
                    onDeleted={() => router.push("/watchlists")}
                  >
                    <Button variant="outline" size="sm">
                      <Trash2 className="size-4" aria-hidden="true" />
                      Delete
                    </Button>
                  </DeleteWatchlistDialog>
                </div>
              </div>
            </CardHeader>
          </Card>

          {watchlist.items.length === 0 ? (
            <WatchlistState
              title="No saved markets"
              description="Add markets from the market table or a market detail page."
              action={
                <Button asChild>
                  <Link href="/markets">Browse markets</Link>
                </Button>
              }
            />
          ) : (
            <SavedMarketsTable
              items={watchlist.items}
              watchlistId={watchlist.id}
            />
          )}
        </>
      )}
    </div>
  );
}

function SavedMarketsTable({
  items,
  watchlistId,
}: {
  items: WatchlistItem[];
  watchlistId: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Market</TableHead>
                <TableHead>Chain</TableHead>
                <TableHead>Supply APY</TableHead>
                <TableHead>Borrow APY</TableHead>
                <TableHead>LLTV</TableHead>
                <TableHead>Liquidity</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <SavedMarketRow
                  key={item.id}
                  item={item}
                  watchlistId={watchlistId}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function SavedMarketRow({
  item,
  watchlistId,
}: {
  item: WatchlistItem;
  watchlistId: string;
}) {
  const market = item.market;
  const marketLabel = market
    ? formatMarketPair(market.loanAsset?.symbol, market.collateralAsset?.symbol)
    : item.marketUniqueKey;

  return (
    <TableRow>
      <TableCell>
        {market ? (
          <Link
            href={`/markets/${encodeURIComponent(item.marketUniqueKey)}`}
            className="font-medium hover:underline"
          >
            {marketLabel}
          </Link>
        ) : (
          <div>
            <p className="font-medium">Unavailable market</p>
            <p className="text-muted-foreground max-w-56 truncate text-xs">
              {item.marketUniqueKey}
            </p>
          </div>
        )}
      </TableCell>
      <TableCell>{market?.chain?.network ?? "Unknown"}</TableCell>
      <TableCell>{formatPercent(market?.state?.supplyApy)}</TableCell>
      <TableCell>{formatPercent(market?.state?.borrowApy)}</TableCell>
      <TableCell>{formatLltv(market?.lltv)}</TableCell>
      <TableCell>
        {formatAssetAmount(
          market?.state?.totalLiquidity,
          market?.loanAsset?.decimals,
          market?.loanAsset?.symbol,
        )}
      </TableCell>
      <TableCell className="text-right">
        <RemoveWatchlistItemDialog
          watchlistId={watchlistId}
          marketUniqueKey={item.marketUniqueKey}
          marketLabel={marketLabel}
        >
          <Button variant="ghost" size="icon" aria-label="Remove saved market">
            <X className="size-4" aria-hidden="true" />
          </Button>
        </RemoveWatchlistItemDialog>
      </TableCell>
    </TableRow>
  );
}
