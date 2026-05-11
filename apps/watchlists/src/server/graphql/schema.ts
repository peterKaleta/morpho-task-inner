import { createSchema } from "graphql-yoga";

import { getMorphoMarket, getMorphoMarkets } from "@/server/services/markets/service";

import type { GraphqlContext } from "./context";
import { toGraphqlError } from "./errors";

export const typeDefs = /* GraphQL */ `
  type Query {
    markets(search: String, first: Int, skip: Int): [Market!]!
    market(marketId: ID!): Market
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
    },
  },
});
