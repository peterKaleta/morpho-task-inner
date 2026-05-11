export type MorphoGraphqlError = {
  message?: string;
  locations?: Array<{
    line: number;
    column: number;
  }>;
  path?: Array<string | number>;
  extensions?: Record<string, unknown>;
};

export class MorphoApiError extends Error {
  constructor(
    message: string,
    readonly options: {
      status?: number;
      graphqlErrors?: MorphoGraphqlError[];
      cause?: unknown;
    } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "MorphoApiError";
  }
}

export function isMorphoApiError(error: unknown): error is MorphoApiError {
  return error instanceof MorphoApiError;
}
