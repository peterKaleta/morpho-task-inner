"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

import { useSession } from "@/providers/session-provider";
import { AuthButtons } from "@/features/auth/auth-buttons";

import { WatchlistState } from "./watchlist-states";

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
  const addMarket = useAddMarketToWatchlistMutation();

  useEffect(() => {
    if (!open) {
      setSelectedWatchlistId("");
      setError(null);
    }
  }, [open]);

  async function handleAdd() {
    if (!selectedWatchlistId) {
      return;
    }

    setError(null);

    try {
      await addMarket.mutateAsync({
        watchlistId: selectedWatchlistId,
        marketUniqueKey: marketId,
      });
      setOpen(false);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not add this market.",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to watchlist</DialogTitle>
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
            <div className="space-y-2">
              <Label htmlFor="watchlist-select">Watchlist</Label>
              <Select
                value={selectedWatchlistId}
                onValueChange={setSelectedWatchlistId}
                disabled={addMarket.isPending}
              >
                <SelectTrigger id="watchlist-select">
                  <SelectValue placeholder="Choose a watchlist" />
                </SelectTrigger>
                <SelectContent>
                  {watchlists.map((watchlist) => (
                    <SelectItem key={watchlist.id} value={watchlist.id}>
                      {watchlist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error ? (
              <p className="text-destructive text-sm" role="alert">
                {error}
              </p>
            ) : null}
            <DialogFooter>
              <Button
                onClick={() => void handleAdd()}
                disabled={!selectedWatchlistId || addMarket.isPending}
              >
                Add
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
