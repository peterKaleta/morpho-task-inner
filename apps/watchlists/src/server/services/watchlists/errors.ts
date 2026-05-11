import { ApplicationError } from "@/server/errors";

export type WatchlistErrorCode =
  | "UNAUTHENTICATED"
  | "WATCHLIST_NOT_FOUND"
  | "WATCHLIST_NAME_TAKEN"
  | "WATCHLIST_ITEM_NOT_FOUND"
  | "MARKET_ALREADY_SAVED"
  | "WATCHLIST_VALIDATION_ERROR";

export class WatchlistError extends ApplicationError {
  constructor(
    message: string,
    code: WatchlistErrorCode,
    status = 400,
  ) {
    super(message, { code, status });
    this.name = "WatchlistError";
  }
}

export function isWatchlistError(error: unknown): error is WatchlistError {
  return error instanceof WatchlistError;
}
