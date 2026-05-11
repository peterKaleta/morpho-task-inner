"use client";

import Link from "next/link";
import { ArrowUpRight, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";

import { useMyWatchlistsQuery, type WatchlistSummary } from "@pk-task/api/data";
import { Badge } from "@pk-task/ui/components/badge";
import { Button } from "@pk-task/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@pk-task/ui/components/card";

import { useSession } from "@/providers/session-provider";
import { AuthButtons } from "@/features/auth/auth-buttons";

import { DeleteWatchlistDialog } from "./delete-watchlist-dialog";
import { WatchlistFormDialog } from "./watchlist-form-dialog";
import { WatchlistSkeleton, WatchlistState } from "./watchlist-states";

export function WatchlistsPageClient() {
  const session = useSession();
  const isSignedIn = session.status === "signed-in";
  const watchlistsQuery = useMyWatchlistsQuery({ enabled: isSignedIn });
  const watchlists = watchlistsQuery.data?.myWatchlists ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal">
            Watchlists
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Create focused lists of Morpho markets to revisit and compare.
          </p>
        </div>
        <WatchlistFormDialog>
          <Button disabled={!isSignedIn}>
            <Plus className="size-4" aria-hidden="true" />
            Create
          </Button>
        </WatchlistFormDialog>
      </div>

      {session.status === "loading" ? (
        <WatchlistSkeleton />
      ) : !isSignedIn ? (
        <WatchlistState
          title="Sign in to use watchlists"
          description="Connect your wallet and sign in from the header to manage saved markets."
          action={<AuthButtons />}
        />
      ) : watchlistsQuery.isPending ? (
        <WatchlistSkeleton />
      ) : watchlistsQuery.isError ? (
        <WatchlistState
          title="Watchlists could not load"
          description="Your saved lists are unavailable right now."
          action={
            <Button onClick={() => void watchlistsQuery.refetch()}>
              <RefreshCw className="size-4" aria-hidden="true" />
              Retry
            </Button>
          }
        />
      ) : watchlists.length === 0 ? (
        <WatchlistState
          title="No watchlists yet"
          description="Create your first list, then save markets into it from the market table or detail page."
          action={
            <WatchlistFormDialog>
              <Button>
                <Plus className="size-4" aria-hidden="true" />
                Create watchlist
              </Button>
            </WatchlistFormDialog>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {watchlists.map((watchlist) => (
            <WatchlistCard key={watchlist.id} watchlist={watchlist} />
          ))}
        </div>
      )}
    </div>
  );
}

function WatchlistCard({ watchlist }: { watchlist: WatchlistSummary }) {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate text-lg">{watchlist.name}</CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {watchlist.description || "No description"}
            </CardDescription>
          </div>
          <Badge variant="secondary">{watchlist.itemCount} markets</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href={`/watchlists/${encodeURIComponent(watchlist.id)}`}>
            Open
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <WatchlistFormDialog watchlist={watchlist}>
            <Button variant="ghost" size="icon" aria-label="Edit watchlist">
              <Pencil className="size-4" aria-hidden="true" />
            </Button>
          </WatchlistFormDialog>
          <DeleteWatchlistDialog
            watchlistId={watchlist.id}
            name={watchlist.name}
          >
            <Button variant="ghost" size="icon" aria-label="Delete watchlist">
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          </DeleteWatchlistDialog>
        </div>
      </CardContent>
    </Card>
  );
}
