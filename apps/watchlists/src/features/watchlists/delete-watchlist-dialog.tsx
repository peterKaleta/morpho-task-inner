"use client";

import { useState } from "react";

import { useDeleteWatchlistMutation } from "@pk-task/api/data";
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

export function DeleteWatchlistDialog({
  children,
  name,
  onDeleted,
  watchlistId,
}: {
  children: React.ReactNode;
  name: string;
  onDeleted?: () => void;
  watchlistId: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const deleteWatchlist = useDeleteWatchlistMutation();

  async function handleDelete() {
    setError(null);

    try {
      await deleteWatchlist.mutateAsync(watchlistId);
      setOpen(false);
      onDeleted?.();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not delete this watchlist.",
      );
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete watchlist?</AlertDialogTitle>
          <AlertDialogDescription>
            {name} and its saved markets will be removed from your active lists.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteWatchlist.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleteWatchlist.isPending}
            onClick={(event) => {
              event.preventDefault();
              void handleDelete();
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
