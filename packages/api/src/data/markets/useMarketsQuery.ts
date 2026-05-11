"use client";

import { useQuery } from "@tanstack/react-query";
import type { TypedDocumentNode } from "urql";

import { requestGraphql } from "../client";
import { graphql } from "../graphql";
import type { Market } from "../types";

export type MarketsQueryData = {
  markets: Market[];
};

export type MarketsQueryVariables = {
  first: number;
  search?: string | null;
  skip: number;
};

export type UseMarketsQueryOptions = {
  page?: number;
  search?: string | null;
};

export const MARKETS_PAGE_SIZE = 20;

export const MARKETS_QUERY = graphql(`
  query Markets($search: String, $first: Int, $skip: Int) {
    markets(search: $search, first: $first, skip: $skip) {
      marketId
      chain {
        id
        network
      }
      loanAsset {
        address
        symbol
        decimals
      }
      collateralAsset {
        address
        symbol
        decimals
      }
      lltv
      state {
        supplyApy
        borrowApy
        totalMarketSize
        totalLiquidity
      }
    }
  }
`) as TypedDocumentNode<MarketsQueryData, MarketsQueryVariables>;

export function useMarketsQuery({
  page = 0,
  search,
}: UseMarketsQueryOptions = {}) {
  const normalizedSearch = search?.trim() || undefined;
  const normalizedPage = Math.max(0, Math.floor(page));
  const skip = normalizedPage * MARKETS_PAGE_SIZE;

  return useQuery({
    queryKey: ["markets", { page: normalizedPage, search: normalizedSearch }],
    queryFn: async () =>
      requestGraphql(MARKETS_QUERY, {
        first: MARKETS_PAGE_SIZE,
        search: normalizedSearch,
        skip,
      }),
  });
}
