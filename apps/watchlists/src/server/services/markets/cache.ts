import { getJsonCache, type JsonCache } from "@/server/cache";

export type { JsonCache };

const MORPHO_CACHE_PREFIX = "morpho:v1";

export function getMorphoApiCache(): JsonCache | null {
  return getJsonCache();
}

export function morphoMarketsCacheKey(input: {
  first: number;
  search?: string | null;
  skip: number;
}): string {
  const search = normalizeSearch(input.search);

  return `${MORPHO_CACHE_PREFIX}:markets:first=${input.first}:skip=${input.skip}:search=${encodeURIComponent(search)}`;
}

export function morphoMarketCacheKey(marketId: string): string {
  return `${MORPHO_CACHE_PREFIX}:market:${marketId.trim()}`;
}

function normalizeSearch(search: string | null | undefined): string {
  return search?.trim() ?? "";
}
