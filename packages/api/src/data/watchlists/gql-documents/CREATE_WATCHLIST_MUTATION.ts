import type { TypedDocumentNode } from "urql";

import { graphql } from "../../graphql";
import type { CreateWatchlistInput, WatchlistSummary } from "../../types";

export type CreateWatchlistMutationData = {
  createWatchlist: WatchlistSummary;
};

export type CreateWatchlistMutationVariables = {
  input: CreateWatchlistInput;
};

export const CREATE_WATCHLIST_MUTATION = graphql(`
  mutation CreateWatchlist($input: CreateWatchlistInput!) {
    createWatchlist(input: $input) {
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
  CreateWatchlistMutationData,
  CreateWatchlistMutationVariables
>;
