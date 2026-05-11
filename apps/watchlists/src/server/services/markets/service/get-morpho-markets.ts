import {
  requestMorphoGraphql,
  type RequestMorphoGraphqlOptions,
} from "../client";
import {
  config as defaultConfig,
  type Config,
} from "../../../../../config-server";
import {
  getMorphoApiCache,
  morphoMarketsCacheKey,
  type JsonCache,
} from "../cache";
import {
  GET_MORPHO_MARKETS_QUERY,
  type GetMorphoMarketsData,
  type GetMorphoMarketsVariables,
} from "../queries/get-morpho-markets";
import type { MarketSummary } from "../types";

type MorphoMarketsServiceConfig = Pick<
  Config,
  "MORPHO_API_CACHE_TTL" | "MORPHO_API_URL"
>;

export type GetMorphoMarketsOptions = Omit<
  RequestMorphoGraphqlOptions,
  "config"
> & {
  cache?: JsonCache | null;
  config?: MorphoMarketsServiceConfig;
  first?: number;
  search?: string | null;
  skip?: number;
};

export async function getMorphoMarkets(
  options: GetMorphoMarketsOptions = {},
): Promise<MarketSummary[]> {
  const {
    cache = getMorphoApiCache(),
    config = defaultConfig,
    first = 100,
    search,
    skip = 0,
    ...requestOptions
  } = options;
  const normalizedSearch = search?.trim() || undefined;

  const loadMarkets = async () => {
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
      {
        ...requestOptions,
        config,
      },
    );

    return data.markets?.items ?? [];
  };

  if (!cache) {
    return await loadMarkets();
  }

  return await cache.getOrSet(
    morphoMarketsCacheKey({
      first,
      search: normalizedSearch,
      skip,
    }),
    {
      ttlSeconds: config.MORPHO_API_CACHE_TTL,
    },
    loadMarkets,
  );
}
