import type { TypedDocumentNode } from "urql";

import { graphql } from "../../graphql";
import type { UpdateWatchlistInput, WatchlistSummary } from "../../types";

export type UpdateWatchlistMutationData = {
  updateWatchlist: WatchlistSummary;
};

export type UpdateWatchlistMutationVariables = {
  input: UpdateWatchlistInput;
};

export const UPDATE_WATCHLIST_MUTATION = graphql(`
  mutation UpdateWatchlist($input: UpdateWatchlistInput!) {
    updateWatchlist(input: $input) {
      id
      name
      description
      itemCount
      marketUniqueKeys
      createdAt
      updatedAt
    }
  }
`) as TypedDocumentNode<
  UpdateWatchlistMutationData,
  UpdateWatchlistMutationVariables
>;
