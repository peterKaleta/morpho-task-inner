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
  search?: string | null;
  skip?: number;
};

export async function getMorphoMarkets(
  options: GetMorphoMarketsOptions = {},
): Promise<MarketSummary[]> {
  const { first = 100, search, skip = 0, ...requestOptions } = options;
  const normalizedSearch = search?.trim() || undefined;
  const data = await requestMorphoGraphql<
    GetMorphoMarketsData,
    GetMorphoMarketsVariables
  >(
    GET_MORPHO_MARKETS_QUERY,
    {
      first,
      search: normalizedSearch,
      skip,
    },
    requestOptions,
  );

  return data.markets?.items ?? [];
}
