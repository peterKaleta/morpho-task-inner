import type { MorphoMarketFields } from "./types";

export const GET_MORPHO_MARKET_QUERY = /* GraphQL */ `
  query GetMorphoMarket($marketIds: [String!]!) {
    markets(first: 1, where: { uniqueKey_in: $marketIds }) {
      items {
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
          utilization
          liquidityAssetsUsd
          supplyAssetsUsd
          borrowAssetsUsd
        }
      }
    }
  }
`;

export type GetMorphoMarketVariables = {
  marketIds: string[];
};

export type GetMorphoMarketData = {
  markets?: {
    items?: MorphoMarketFields[] | null;
  } | null;
};
