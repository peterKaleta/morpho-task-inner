export type ApplicationErrorCode =
  | "INTERNAL_SERVER_ERROR"
  | "MORPHO_MARKET_DATA_ERROR"
  | "UNAUTHENTICATED"
  | "WATCHLIST_NOT_FOUND"
  | "WATCHLIST_NAME_TAKEN"
  | "WATCHLIST_ITEM_NOT_FOUND"
  | "MARKET_ALREADY_SAVED"
  | "WATCHLIST_VALIDATION_ERROR";

export type ApplicationErrorOptions = {
  cause?: unknown;
  code: ApplicationErrorCode;
  details?: unknown;
  status?: number;
};

export class ApplicationError extends Error {
  readonly code: ApplicationErrorCode;
  readonly details?: unknown;
  readonly status: number;

  constructor(message: string, options: ApplicationErrorOptions) {
    super(message, { cause: options.cause });
    this.name = "ApplicationError";
    this.code = options.code;
    this.details = options.details;
    this.status = options.status ?? 500;
  }
}

export class ApplicationValidationError extends ApplicationError {
  constructor(
    message = "Invalid input.",
    options: Omit<ApplicationErrorOptions, "code" | "status"> & {
      code?: ApplicationErrorCode;
    } = {},
  ) {
    super(message, {
      ...options,
      code: options.code ?? "WATCHLIST_VALIDATION_ERROR",
      status: 400,
    });
    this.name = "ApplicationValidationError";
  }
}

export class AuthenticationRequiredError extends ApplicationError {
  constructor(message = "Sign in to continue.") {
    super(message, {
      code: "UNAUTHENTICATED",
      status: 401,
    });
    this.name = "AuthenticationRequiredError";
  }
}

export function isApplicationError(
  error: unknown,
): error is ApplicationError {
  return error instanceof ApplicationError;
}
