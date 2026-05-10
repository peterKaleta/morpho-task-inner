import {
  requestMorphoGraphql,
  type RequestMorphoGraphqlOptions,
} from "../client";
import { MorphoApiError } from "../errors";
import {
  GET_MORPHO_MARKET_QUERY,
  type GetMorphoMarketData,
  type GetMorphoMarketVariables,
} from "../queries/get-morpho-market";
import type { MarketDetail } from "../types";

export type GetMorphoMarketOptions = RequestMorphoGraphqlOptions;

export async function getMorphoMarket(
  marketId: string,
  options: GetMorphoMarketOptions = {},
): Promise<MarketDetail | null> {
  const normalizedMarketId = marketId.trim();

  if (!normalizedMarketId) {
    throw new MorphoApiError("Market id is required.");
  }

  const data = await requestMorphoGraphql<
    GetMorphoMarketData,
    GetMorphoMarketVariables
  >(
    GET_MORPHO_MARKET_QUERY,
    {
      marketIds: [normalizedMarketId],
    },
    options,
  );
  return data.markets?.items?.[0] ?? null;
}
