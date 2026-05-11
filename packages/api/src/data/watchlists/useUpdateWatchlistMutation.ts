"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { mutateGraphql } from "../client";
import {
  UPDATE_WATCHLIST_MUTATION,
  type UpdateWatchlistMutationVariables,
} from "./gql-documents";
import { watchlistQueryKey, watchlistsQueryKey } from "./queryKeys";

export function useUpdateWatchlistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateWatchlistMutationVariables["input"]) =>
      mutateGraphql(UPDATE_WATCHLIST_MUTATION, { input }),
    onSuccess: async (_data, input) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: watchlistsQueryKey }),
        queryClient.invalidateQueries({ queryKey: watchlistQueryKey(input.id) }),
      ]);
    },
  });
}
