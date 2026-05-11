"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  useAddMarketToWatchlistMutation,
  useMyWatchlistsQuery,
} from "@pk-task/api/data";
import { Button } from "@pk-task/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@pk-task/ui/components/dialog";
import { Label } from "@pk-task/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pk-task/ui/components/select";
import { toast } from "@pk-task/ui/components/sonner";

import { useSession } from "@/providers/session-provider";
import { AuthButtons } from "@/features/auth/auth-buttons";

import { WatchlistState } from "./watchlist-states";
import { RemoveWatchlistItemDialog } from "./remove-watchlist-item-dialog";

export function AddToWatchlistDialog({
  children,
  marketId,
  marketLabel,
}: {
  children: React.ReactNode;
  marketId: string;
  marketLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [selectedWatchlistId, setSelectedWatchlistId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const session = useSession();
  const isSignedIn = session.status === "signed-in";
  const watchlistsQuery = useMyWatchlistsQuery({ enabled: open && isSignedIn });
  const watchlists = watchlistsQuery.data?.myWatchlists ?? [];
  const currentWatchlists = useMemo(
    () =>
      watchlists.filter((watchlist) =>
        watchlist.marketUniqueKeys.includes(marketId),
      ),
    [marketId, watchlists],
  );
  const availableWatchlists = useMemo(
    () =>
      watchlists.filter(
        (watchlist) => !watchlist.marketUniqueKeys.includes(marketId),
      ),
    [marketId, watchlists],
  );
  const addMarket = useAddMarketToWatchlistMutation();

  useEffect(() => {
    if (!open) {
      setSelectedWatchlistId("");
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (
      selectedWatchlistId &&
      !availableWatchlists.some(
        (watchlist) => watchlist.id === selectedWatchlistId,
      )
    ) {
      setSelectedWatchlistId("");
    }
  }, [availableWatchlists, selectedWatchlistId]);

  async function handleAdd() {
    if (!selectedWatchlistId) {
      return;
    }

    setError(null);

    try {
      const selectedWatchlist = watchlists.find(
        (watchlist) => watchlist.id === selectedWatchlistId,
      );

      await addMarket.mutateAsync({
        watchlistId: selectedWatchlistId,
        marketUniqueKey: marketId,
      });
      toast.success("Market added", {
        description: selectedWatchlist
          ? `Added to ${selectedWatchlist.name}.`
          : "Added to watchlist.",
      });
      setOpen(false);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Could not add this market.";

      setError(message);
      toast.error("Could not add market", {
        description: message,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Market&apos;s watchlists</DialogTitle>
          <DialogDescription className="break-words">
            Save {marketLabel} to one of your lists.
          </DialogDescription>
        </DialogHeader>

        {!isSignedIn ? (
          <WatchlistState
            title="Sign in required"
            description="Connect and sign with your wallet before saving markets."
            action={<AuthButtons />}
          />
        ) : watchlistsQuery.isPending ? (
          <div
            className="bg-muted h-28 animate-pulse rounded-md"
            aria-hidden="true"
          />
        ) : watchlistsQuery.isError ? (
          <WatchlistState
            title="Watchlists could not load"
            description="Try loading your watchlists again."
            action={
              <Button onClick={() => void watchlistsQuery.refetch()}>
                Retry
              </Button>
            }
          />
        ) : watchlists.length === 0 ? (
          <WatchlistState
            title="No watchlists yet"
            description="Create a watchlist before saving this market."
            action={
              <Button asChild>
                <Link href="/watchlists">Open watchlists</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {currentWatchlists.length > 0 ? (
              <div className="space-y-2">
                <Label>Currently in</Label>
                <div className="divide-y divide-border overflow-hidden rounded-md border">
                  {currentWatchlists.map((watchlist) => (
                    <div
                      key={watchlist.id}
                      className="flex items-center justify-between gap-3 p-3"
                    >
                      <span className="min-w-0 truncate text-sm font-medium">
                        {watchlist.name}
                      </span>
                      <RemoveWatchlistItemDialog
                        watchlistId={watchlist.id}
                        watchlistName={watchlist.name}
                        marketUniqueKey={marketId}
                        marketLabel={marketLabel}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove ${marketId} from ${watchlist.name}`}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      </RemoveWatchlistItemDialog>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {availableWatchlists.length > 0 ? (
              <div className="space-y-2">
                <Label htmlFor="watchlist-select">Add to</Label>
                <Select
                  value={selectedWatchlistId}
                  onValueChange={setSelectedWatchlistId}
                  disabled={addMarket.isPending}
                >
                  <SelectTrigger id="watchlist-select">
                    <SelectValue placeholder="Choose a watchlist" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableWatchlists.map((watchlist) => (
                      <SelectItem key={watchlist.id} value={watchlist.id}>
                        {watchlist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="watchlist-select">Add to</Label>
                <Select disabled>
                  <SelectTrigger id="watchlist-select">
                    <SelectValue placeholder="No available watchlists" />
                  </SelectTrigger>
                </Select>
              </div>
            )}
            {error ? (
              <p className="text-destructive text-sm" role="alert">
                {error}
              </p>
            ) : null}
            {availableWatchlists.length > 0 ? (
              <DialogFooter>
                <Button
                  onClick={() => void handleAdd()}
                  disabled={!selectedWatchlistId || addMarket.isPending}
                >
                  Add
                </Button>
              </DialogFooter>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
