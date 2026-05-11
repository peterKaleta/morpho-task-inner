"use client";

import { useEffect, useState } from "react";

import {
  useCreateWatchlistMutation,
  useUpdateWatchlistMutation,
  type WatchlistSummary,
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
import { Input } from "@pk-task/ui/components/input";
import { Label } from "@pk-task/ui/components/label";
import { toast } from "@pk-task/ui/components/sonner";
import { Textarea } from "@pk-task/ui/components/textarea";

export function WatchlistFormDialog({
  children,
  onCompleted,
  open,
  onOpenChange,
  watchlist,
}: {
  children?: React.ReactNode;
  onCompleted?: (watchlist: WatchlistSummary) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  watchlist?: Pick<WatchlistSummary, "id" | "name" | "description"> | null;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [name, setName] = useState(watchlist?.name ?? "");
  const [description, setDescription] = useState(watchlist?.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const createWatchlist = useCreateWatchlistMutation();
  const updateWatchlist = useUpdateWatchlistMutation();
  const isOpen = open ?? internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;
  const isEditing = Boolean(watchlist);
  const isPending = createWatchlist.isPending || updateWatchlist.isPending;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setName(watchlist?.name ?? "");
    setDescription(watchlist?.description ?? "");
    setError(null);
  }, [isOpen, watchlist]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      const input = {
        name,
        description,
      };
      const savedWatchlist = isEditing
        ? (
            await updateWatchlist.mutateAsync({
              id: watchlist!.id,
              ...input,
            })
          ).updateWatchlist
        : (await createWatchlist.mutateAsync(input)).createWatchlist;

      toast.success(isEditing ? "Watchlist updated" : "Watchlist created", {
        description: `${savedWatchlist.name} is ready.`,
      });
      onCompleted?.(savedWatchlist);
      setIsOpen(false);
    } catch (caughtError) {
      const message = getErrorMessage(caughtError);

      setError(message);
      toast.error("Could not save watchlist", {
        description: message,
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit watchlist" : "Create watchlist"}
          </DialogTitle>
          <DialogDescription>
            Name the list and add an optional note for what belongs in it.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="watchlist-name">Name</Label>
            <Input
              id="watchlist-name"
              value={name}
              maxLength={80}
              onChange={(event) => setName(event.target.value)}
              disabled={isPending}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="watchlist-description">Description</Label>
            <Textarea
              id="watchlist-description"
              value={description}
              maxLength={280}
              onChange={(event) => setDescription(event.target.value)}
              disabled={isPending}
              rows={4}
            />
          </div>
          {error ? (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isEditing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Could not save this watchlist.";
}
