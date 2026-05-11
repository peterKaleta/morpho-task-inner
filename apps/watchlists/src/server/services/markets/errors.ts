import { ApplicationError } from "@/server/errors";

export type MorphoGraphqlError = {
  message?: string;
  locations?: Array<{
    line: number;
    column: number;
  }>;
  path?: Array<string | number>;
  extensions?: Record<string, unknown>;
};

export class MorphoApiError extends ApplicationError {
  readonly upstreamMessage: string;

  constructor(
    message: string,
    readonly options: {
      status?: number;
      graphqlErrors?: MorphoGraphqlError[];
      cause?: unknown;
    } = {},
  ) {
    super("Unable to load Morpho market data right now.", {
      cause: options.cause,
      code: "MORPHO_MARKET_DATA_ERROR",
      details: options.graphqlErrors,
      status: options.status,
    });
    this.name = "MorphoApiError";
    this.upstreamMessage = message;
  }
}

export function isMorphoApiError(error: unknown): error is MorphoApiError {
  return error instanceof MorphoApiError;
}
