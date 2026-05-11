import type { TypedDocumentNode } from "urql";

import { graphql } from "../../graphql";
import type { Watchlist } from "../../types";

export type WatchlistQueryData = {
  watchlist: Watchlist | null;
};

export type WatchlistQueryVariables = {
  id: string;
};

export const WATCHLIST_QUERY = graphql(`
  query Watchlist($id: ID!) {
    watchlist(id: $id) {
      id
      name
      description
      createdAt
      updatedAt
      items {
        id
        marketUniqueKey
        createdAt
        market {
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
    }
  }
`) as TypedDocumentNode<WatchlistQueryData, WatchlistQueryVariables>;
