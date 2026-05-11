import type { TypedDocumentNode } from "urql";

import { graphql } from "../../graphql";
import type { RemoveMarketFromWatchlistInput } from "../../types";

export type RemoveMarketFromWatchlistMutationData = {
  removeMarketFromWatchlist: {
    watchlistId: string;
    marketUniqueKey: string;
  };
};

export type RemoveMarketFromWatchlistMutationVariables = {
  input: RemoveMarketFromWatchlistInput;
};

export const REMOVE_MARKET_FROM_WATCHLIST_MUTATION = graphql(`
  mutation RemoveMarketFromWatchlist($input: RemoveMarketFromWatchlistInput!) {
    removeMarketFromWatchlist(input: $input) {
      watchlistId
      marketUniqueKey
    }
  }
`) as TypedDocumentNode<
  RemoveMarketFromWatchlistMutationData,
  RemoveMarketFromWatchlistMutationVariables
>;
