import type { MorphoMarketFields } from "./types";

export const GET_MORPHO_MARKETS_QUERY = /* GraphQL */ `
  query GetMorphoMarkets($first: Int!, $skip: Int!, $search: String) {
    markets(
      first: $first
      skip: $skip
      where: { search: $search }
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
          totalMarketSize: supplyAssets
          totalLiquidity: liquidityAssets
        }
      }
    }
  }
`;

export type GetMorphoMarketsVariables = {
  first: number;
  skip: number;
  search?: string;
};

export type GetMorphoMarketsData = {
  markets?: {
    items?: MorphoMarketFields[] | null;
  } | null;
};
