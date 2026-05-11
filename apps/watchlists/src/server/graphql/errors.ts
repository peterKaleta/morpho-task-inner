import { GraphQLError } from "graphql";

import { isMorphoApiError } from "@/server/morpho-api/errors";

export const MORPHO_MARKET_DATA_ERROR_CODE = "MORPHO_MARKET_DATA_ERROR";

export function toGraphqlError(error: unknown): GraphQLError {
  if (isMorphoApiError(error)) {
    return new GraphQLError("Unable to load Morpho market data right now.", {
      extensions: {
        code: MORPHO_MARKET_DATA_ERROR_CODE,
        status: error.options.status,
      },
      originalError: error,
    });
  }

  if (error instanceof GraphQLError) {
    return error;
  }

  return new GraphQLError("Something went wrong.", {
    extensions: {
      code: "INTERNAL_SERVER_ERROR",
    },
  });
}
