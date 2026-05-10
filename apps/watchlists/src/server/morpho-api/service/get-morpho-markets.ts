import {
  requestMorphoGraphql,
  type RequestMorphoGraphqlOptions,
} from "../client";
import {
  GET_MORPHO_MARKETS_QUERY,
  type GetMorphoMarketsData,
  type GetMorphoMarketsVariables,
} from "../queries/get-morpho-markets";
import type { MarketSummary } from "../types";

export type GetMorphoMarketsOptions = RequestMorphoGraphqlOptions & {
  first?: number;
  skip?: number;
};

export async function getMorphoMarkets(
  options: GetMorphoMarketsOptions = {},
): Promise<MarketSummary[]> {
  const { first = 100, skip = 0, ...requestOptions } = options;
  const data = await requestMorphoGraphql<
    GetMorphoMarketsData,
    GetMorphoMarketsVariables
  >(
    GET_MORPHO_MARKETS_QUERY,
    {
      first,
      skip,
    },
    requestOptions,
  );

  return data.markets?.items ?? [];
}
