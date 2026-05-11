"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { mutateGraphql } from "../client";
import {
  type MyWatchlistsQueryData,
  CREATE_WATCHLIST_MUTATION,
  type CreateWatchlistMutationVariables,
} from "./gql-documents";
import { watchlistsQueryKey } from "./queryKeys";

export function useCreateWatchlistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateWatchlistMutationVariables["input"]) =>
      mutateGraphql(CREATE_WATCHLIST_MUTATION, { input }),
    onSuccess: async (data) => {
      queryClient.setQueryData<MyWatchlistsQueryData>(
        watchlistsQueryKey,
        (current) => {
          if (!current) {
            return {
              myWatchlists: [data.createWatchlist],
            };
          }

          return {
            myWatchlists: [
              data.createWatchlist,
              ...current.myWatchlists.filter(
                (watchlist) => watchlist.id !== data.createWatchlist.id,
              ),
            ],
          };
        },
      );
      await queryClient.invalidateQueries({ queryKey: watchlistsQueryKey });
    },
  });
}
