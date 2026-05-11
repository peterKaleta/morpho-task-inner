"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { mutateGraphql } from "../client";
import {
  DELETE_WATCHLIST_MUTATION,
  type MyWatchlistsQueryData,
} from "./gql-documents";
import { watchlistQueryKey, watchlistsQueryKey } from "./queryKeys";

export function useDeleteWatchlistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => mutateGraphql(DELETE_WATCHLIST_MUTATION, { id }),
    onSuccess: async (data) => {
      const deletedId = data.deleteWatchlist.deletedId;

      queryClient.setQueryData<MyWatchlistsQueryData>(
        watchlistsQueryKey,
        (current) =>
          current
            ? {
                myWatchlists: current.myWatchlists.filter(
                  (watchlist) => watchlist.id !== deletedId,
                ),
              }
            : current,
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: watchlistsQueryKey }),
        queryClient.invalidateQueries({ queryKey: watchlistQueryKey(deletedId) }),
      ]);
    },
  });
}
