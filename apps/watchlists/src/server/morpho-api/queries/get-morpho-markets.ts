import type { MorphoMarketFields } from "./types";

export const GET_MORPHO_MARKETS_QUERY = /* GraphQL */ `
  query GetMorphoMarkets($first: Int!, $skip: Int!) {
    markets(
      first: $first
      skip: $skip
      orderBy: SupplyAssetsUsd
      orderDirection: Desc
    ) {
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

export type GetMorphoMarketsVariables = {
  first: number;
  skip: number;
};

export type GetMorphoMarketsData = {
  markets?: {
    items?: MorphoMarketFields[] | null;
  } | null;
};
