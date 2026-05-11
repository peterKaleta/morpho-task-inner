"use client";

import { useState } from "react";

import { useRemoveMarketFromWatchlistMutation } from "@pk-task/api/data";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@pk-task/ui/components/alert-dialog";

export function RemoveWatchlistItemDialog({
  children,
  marketLabel,
  marketUniqueKey,
  watchlistId,
}: {
  children: React.ReactNode;
  marketLabel: string;
  marketUniqueKey: string;
  watchlistId: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const removeMarket = useRemoveMarketFromWatchlistMutation();

  async function handleRemove() {
    setError(null);

    try {
      await removeMarket.mutateAsync({ watchlistId, marketUniqueKey });
      setOpen(false);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not remove this market.",
      );
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove saved market?</AlertDialogTitle>
          <AlertDialogDescription>
            {marketLabel} will be removed from this watchlist.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={removeMarket.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={removeMarket.isPending}
            onClick={(event) => {
              event.preventDefault();
              void handleRemove();
            }}
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
