"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { mutateGraphql } from "../client";
import {
  ADD_MARKET_TO_WATCHLIST_MUTATION,
  type AddMarketToWatchlistMutationVariables,
} from "./gql-documents";
import { watchlistQueryKey, watchlistsQueryKey } from "./queryKeys";

export function useAddMarketToWatchlistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddMarketToWatchlistMutationVariables["input"]) =>
      mutateGraphql(ADD_MARKET_TO_WATCHLIST_MUTATION, { input }),
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
