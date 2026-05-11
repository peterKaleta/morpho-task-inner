"use client";

import { useQuery } from "@tanstack/react-query";

import { requestGraphql } from "../client";
import { WATCHLIST_QUERY } from "./gql-documents";
import { watchlistQueryKey } from "./queryKeys";

export function useWatchlistQuery(id: string, { enabled = true } = {}) {
  return useQuery({
    queryKey: watchlistQueryKey(id),
    queryFn: async () => requestGraphql(WATCHLIST_QUERY, { id }),
    enabled: enabled && id.trim().length > 0,
  });
}
