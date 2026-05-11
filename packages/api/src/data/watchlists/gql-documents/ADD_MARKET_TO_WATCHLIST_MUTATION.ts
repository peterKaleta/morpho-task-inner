import type { TypedDocumentNode } from "urql";

import { graphql } from "../../graphql";
import type { AddMarketToWatchlistInput, WatchlistItem } from "../../types";

export type AddMarketToWatchlistMutationData = {
  addMarketToWatchlist: WatchlistItem;
};

export type AddMarketToWatchlistMutationVariables = {
  input: AddMarketToWatchlistInput;
};

export const ADD_MARKET_TO_WATCHLIST_MUTATION = graphql(`
  mutation AddMarketToWatchlist($input: AddMarketToWatchlistInput!) {
    addMarketToWatchlist(input: $input) {
      id
      marketUniqueKey
      createdAt
      market {
        marketId
        watchlistCount
      }
    }
  }
`) as TypedDocumentNode<
  AddMarketToWatchlistMutationData,
  AddMarketToWatchlistMutationVariables
>;
