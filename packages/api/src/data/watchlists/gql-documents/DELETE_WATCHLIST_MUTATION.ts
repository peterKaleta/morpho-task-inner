import type { TypedDocumentNode } from "urql";

import { graphql } from "../../graphql";

export type DeleteWatchlistMutationData = {
  deleteWatchlist: {
    deletedId: string;
  };
};

export type DeleteWatchlistMutationVariables = {
  id: string;
};

export const DELETE_WATCHLIST_MUTATION = graphql(`
  mutation DeleteWatchlist($id: ID!) {
    deleteWatchlist(id: $id) {
      deletedId
    }
  }
`) as TypedDocumentNode<
  DeleteWatchlistMutationData,
  DeleteWatchlistMutationVariables
>;
