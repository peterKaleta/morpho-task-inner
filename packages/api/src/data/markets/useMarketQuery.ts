"use client";

import { useQuery } from "@tanstack/react-query";
import type { TypedDocumentNode } from "urql";

import { requestGraphql } from "../client";
import { graphql } from "../graphql";
import type { Market } from "../types";

export type MarketQueryData = {
  market: Market | null;
};

export type MarketQueryVariables = {
  marketId: string;
};

export const MARKET_QUERY = graphql(`
  query Market($marketId: ID!) {
    market(marketId: $marketId) {
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
`) as TypedDocumentNode<MarketQueryData, MarketQueryVariables>;

export function useMarketQuery(marketId: string) {
  return useQuery({
    queryKey: ["market", marketId],
    queryFn: async () => requestGraphql(MARKET_QUERY, { marketId }),
    enabled: marketId.trim().length > 0,
  });
}
