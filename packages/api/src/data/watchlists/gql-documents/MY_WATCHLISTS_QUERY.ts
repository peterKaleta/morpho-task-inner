import type { TypedDocumentNode } from "urql";

import { graphql } from "../../graphql";
import type { WatchlistSummary } from "../../types";

export type MyWatchlistsQueryData = {
  myWatchlists: WatchlistSummary[];
};

export type MyWatchlistsQueryVariables = Record<string, never>;

export const MY_WATCHLISTS_QUERY = graphql(`
  query MyWatchlists {
    myWatchlists {
      id
      name
      description
      itemCount
      marketUniqueKeys
      createdAt
      updatedAt
    }
  }
`) as TypedDocumentNode<MyWatchlistsQueryData, MyWatchlistsQueryVariables>;
