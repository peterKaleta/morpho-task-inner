"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { mutateGraphql } from "../client";
import {
  REMOVE_MARKET_FROM_WATCHLIST_MUTATION,
  type RemoveMarketFromWatchlistMutationVariables,
} from "./gql-documents";
import { watchlistQueryKey, watchlistsQueryKey } from "./queryKeys";

export function useRemoveMarketFromWatchlistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: RemoveMarketFromWatchlistMutationVariables["input"],
    ) => mutateGraphql(REMOVE_MARKET_FROM_WATCHLIST_MUTATION, { input }),
    onSuccess: async (_data, input) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["markets"] }),
        queryClient.invalidateQueries({
          queryKey: ["market", input.marketUniqueKey],
        }),
        queryClient.invalidateQueries({ queryKey: watchlistsQueryKey }),
        queryClient.invalidateQueries({
          queryKey: watchlistQueryKey(input.watchlistId),
        }),
      ]);
    },
  });
}
