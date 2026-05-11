import { createSchema } from "graphql-yoga";

import { AuthenticationRequiredError } from "@/server/errors";
import { getMorphoMarket, getMorphoMarkets } from "@/server/services/markets/service";
import type { CurrentUser } from "@/server/services/auth/current-user";
import {
  addMarketToWatchlist,
  createWatchlist,
  deleteWatchlist,
  getUserWatchlist,
  listUserWatchlists,
  removeMarketFromWatchlist,
  updateWatchlist,
  type WatchlistDetail,
  type WatchlistItem,
} from "@/server/services/watchlists";

import type { GraphqlContext } from "./context";
import { toGraphqlError } from "./errors";

export const typeDefs = /* GraphQL */ `
  type Query {
    markets(search: String, first: Int, skip: Int): [Market!]!
    market(marketId: ID!): Market
    myWatchlists: [WatchlistSummary!]!
    watchlist(id: ID!): Watchlist
  }

  type Mutation {
    createWatchlist(input: CreateWatchlistInput!): WatchlistSummary!
    updateWatchlist(input: UpdateWatchlistInput!): WatchlistSummary!
    deleteWatchlist(id: ID!): DeleteWatchlistPayload!
    addMarketToWatchlist(input: AddMarketToWatchlistInput!): WatchlistItem!
    removeMarketFromWatchlist(input: RemoveMarketFromWatchlistInput!): RemoveMarketFromWatchlistPayload!
  }

  type Market {
    marketId: ID!
    chain: MarketChain
    loanAsset: MarketAsset
    collateralAsset: MarketAsset
    lltv: String
    state: MarketState
  }

  type MarketChain {
    id: Int
    network: String
  }

  type MarketAsset {
    address: String
    symbol: String
    decimals: Int
  }

  type MarketState {
    supplyApy: Float
    borrowApy: Float
    totalMarketSize: String
    totalLiquidity: String
  }

  type WatchlistSummary {
    id: ID!
    name: String!
    description: String
    itemCount: Int!
    createdAt: String!
    updatedAt: String!
  }

  type Watchlist {
    id: ID!
    name: String!
    description: String
    items: [WatchlistItem!]!
    createdAt: String!
    updatedAt: String!
  }

  type WatchlistItem {
    id: ID!
    marketUniqueKey: ID!
    market: Market
    createdAt: String!
  }

  input CreateWatchlistInput {
    name: String!
    description: String
  }

  input UpdateWatchlistInput {
    id: ID!
    name: String!
    description: String
  }

  input AddMarketToWatchlistInput {
    watchlistId: ID!
    marketUniqueKey: ID!
  }

  input RemoveMarketFromWatchlistInput {
    watchlistId: ID!
    marketUniqueKey: ID!
  }

  type DeleteWatchlistPayload {
    deletedId: ID!
  }

  type RemoveMarketFromWatchlistPayload {
    watchlistId: ID!
    marketUniqueKey: ID!
  }
`;

export const schema = createSchema<GraphqlContext>({
  typeDefs,
  resolvers: {
    Query: {
      markets: async (
        _parent,
        args: {
          first?: number | null;
          search?: string | null;
          skip?: number | null;
        },
      ) => {
        try {
          return await getMorphoMarkets({
            first: args.first ?? undefined,
            search: args.search,
            skip: args.skip ?? undefined,
          });
        } catch (error) {
          throw toGraphqlError(error);
        }
      },
      market: async (_parent, args: { marketId: string }) => {
        try {
          return await getMorphoMarket(args.marketId);
        } catch (error) {
          throw toGraphqlError(error);
        }
      },
      myWatchlists: async (_parent, _args, context) => {
        try {
          const currentUser = requireCurrentUser(context);

          return await listUserWatchlists(currentUser.id);
        } catch (error) {
          throw toGraphqlError(error);
        }
      },
      watchlist: async (_parent, args: { id: string }, context) => {
        try {
          const currentUser = requireCurrentUser(context);
          const watchlist = await getUserWatchlist({
            userId: currentUser.id,
            watchlistId: args.id,
          });

          return watchlist ? hydrateWatchlistMarkets(watchlist) : null;
        } catch (error) {
          throw toGraphqlError(error);
        }
      },
    },
    Mutation: {
      createWatchlist: async (
        _parent,
        args: { input: { name: string; description?: string | null } },
        context,
      ) => {
        try {
          const currentUser = requireCurrentUser(context);

          return await createWatchlist({
            userId: currentUser.id,
            name: args.input.name,
            description: args.input.description,
          });
        } catch (error) {
          throw toGraphqlError(error);
        }
      },
      updateWatchlist: async (
        _parent,
        args: {
          input: { id: string; name: string; description?: string | null };
        },
        context,
      ) => {
        try {
          const currentUser = requireCurrentUser(context);

          return await updateWatchlist({
            userId: currentUser.id,
            watchlistId: args.input.id,
            name: args.input.name,
            description: args.input.description,
          });
        } catch (error) {
          throw toGraphqlError(error);
        }
      },
      deleteWatchlist: async (
        _parent,
        args: { id: string },
        context,
      ) => {
        try {
          const currentUser = requireCurrentUser(context);

          return await deleteWatchlist({
            userId: currentUser.id,
            watchlistId: args.id,
          });
        } catch (error) {
          throw toGraphqlError(error);
        }
      },
      addMarketToWatchlist: async (
        _parent,
        args: { input: { watchlistId: string; marketUniqueKey: string } },
        context,
      ) => {
        try {
          const currentUser = requireCurrentUser(context);
          const item = await addMarketToWatchlist({
            userId: currentUser.id,
            watchlistId: args.input.watchlistId,
            marketUniqueKey: args.input.marketUniqueKey,
          });

          return hydrateWatchlistItemMarket(item);
        } catch (error) {
          throw toGraphqlError(error);
        }
      },
      removeMarketFromWatchlist: async (
        _parent,
        args: { input: { watchlistId: string; marketUniqueKey: string } },
        context,
      ) => {
        try {
          const currentUser = requireCurrentUser(context);

          return await removeMarketFromWatchlist({
            userId: currentUser.id,
            watchlistId: args.input.watchlistId,
            marketUniqueKey: args.input.marketUniqueKey,
          });
        } catch (error) {
          throw toGraphqlError(error);
        }
      },
    },
  },
});

function requireCurrentUser(context: GraphqlContext): CurrentUser {
  if (!context.currentUser) {
    throw new AuthenticationRequiredError("Sign in to manage watchlists.");
  }

  return context.currentUser;
}

async function hydrateWatchlistMarkets(
  watchlist: WatchlistDetail,
): Promise<WatchlistDetail> {
  return {
    ...watchlist,
    items: await Promise.all(watchlist.items.map(hydrateWatchlistItemMarket)),
  };
}

async function hydrateWatchlistItemMarket(
  item: WatchlistItem,
): Promise<WatchlistItem> {
  try {
    return {
      ...item,
      market: await getMorphoMarket(item.marketUniqueKey),
    };
  } catch {
    return {
      ...item,
      market: null,
    };
  }
}
