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
  morphoMarketCacheKey,
  type JsonCache,
} from "../cache";
import { MorphoApiError } from "../errors";
import {
  GET_MORPHO_MARKET_QUERY,
  type GetMorphoMarketData,
  type GetMorphoMarketVariables,
} from "../queries/get-morpho-market";
import type { MarketDetail } from "../types";

type MorphoMarketServiceConfig = Pick<
  Config,
  "MORPHO_API_CACHE_TTL" | "MORPHO_API_URL"
>;

export type GetMorphoMarketOptions = Omit<
  RequestMorphoGraphqlOptions,
  "config"
> & {
  cache?: JsonCache | null;
  config?: MorphoMarketServiceConfig;
};

export async function getMorphoMarket(
  marketId: string,
  options: GetMorphoMarketOptions = {},
): Promise<MarketDetail | null> {
  const {
    cache = getMorphoApiCache(),
    config = defaultConfig,
    ...requestOptions
  } = options;
  const normalizedMarketId = marketId.trim();

  if (!normalizedMarketId) {
    throw new MorphoApiError("Market id is required.");
  }

  const loadMarket = async () => {
    const data = await requestMorphoGraphql<
      GetMorphoMarketData,
      GetMorphoMarketVariables
    >(
      GET_MORPHO_MARKET_QUERY,
      {
        marketIds: [normalizedMarketId],
      },
      {
        ...requestOptions,
        config,
      },
    );

    return data.markets?.items?.[0] ?? null;
  };

  if (!cache) {
    return await loadMarket();
  }

  const cacheKey = morphoMarketCacheKey(normalizedMarketId);
  const cachedMarket = await cache.get<MarketDetail>(cacheKey);

  if (cachedMarket) {
    return cachedMarket;
  }

  const freshMarket = await loadMarket();

  if (freshMarket) {
    await cache.set(cacheKey, freshMarket, {
      ttlSeconds: config.MORPHO_API_CACHE_TTL,
    });
  }

  return freshMarket;
}
