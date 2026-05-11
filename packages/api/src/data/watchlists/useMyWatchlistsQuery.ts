"use client";

import { useQuery } from "@tanstack/react-query";

import { requestGraphql } from "../client";
import { MY_WATCHLISTS_QUERY } from "./gql-documents";
import { watchlistsQueryKey } from "./queryKeys";

export function useMyWatchlistsQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: watchlistsQueryKey,
    queryFn: async () => requestGraphql(MY_WATCHLISTS_QUERY, {}),
    enabled,
  });
}
