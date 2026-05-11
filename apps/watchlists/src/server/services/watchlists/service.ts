import { getDb, type Database } from "@pk-task/db";
import { z } from "@pk-task/shared/text-helpers";

import { ApplicationValidationError } from "@/server/errors";
import { WatchlistError } from "./errors";
import {
  addMarketToWatchlistInputSchema,
  createWatchlistInputSchema,
  removeMarketFromWatchlistInputSchema,
  updateWatchlistInputSchema,
} from "./validation";
import {
  createUserWatchlist,
  createWatchlistItem,
  countUserWatchlistsContainingMarket,
  deleteUserWatchlist,
  findActiveWatchlist,
  findActiveWatchlistItem,
  getUserWatchlist,
  listUserWatchlists,
  removeWatchlistItem,
  updateUserWatchlist,
} from "./repository";
import type { WatchlistDetail, WatchlistItem, WatchlistSummary } from "./types";

export {
  countUserWatchlistsContainingMarket,
  getUserWatchlist,
  listUserWatchlists,
};

export async function createWatchlist(
  input: {
    userId: string;
    name: string;
    description?: string | null;
  },
  db: Database = getDb(),
): Promise<WatchlistSummary> {
  const parsed = parseWatchlistInput(createWatchlistInputSchema, input);

  try {
    return await createUserWatchlist(
      {
        userId: input.userId,
        name: parsed.name,
        description: parsed.description,
      },
      db,
    );
  } catch (error) {
    throw mapRepositoryError(error);
  }
}

export async function updateWatchlist(
  input: {
    userId: string;
    watchlistId: string;
    name: string;
    description?: string | null;
  },
  db: Database = getDb(),
): Promise<WatchlistSummary> {
  const parsed = parseWatchlistInput(updateWatchlistInputSchema, {
    id: input.watchlistId,
    name: input.name,
    description: input.description,
  });

  try {
    const watchlist = await updateUserWatchlist(
      {
        userId: input.userId,
        watchlistId: parsed.id,
        name: parsed.name,
        description: parsed.description,
      },
      db,
    );

    if (!watchlist) {
      throw new WatchlistError(
        "Watchlist was not found.",
        "WATCHLIST_NOT_FOUND",
        404,
      );
    }

    return watchlist;
  } catch (error) {
    throw mapRepositoryError(error);
  }
}

export async function deleteWatchlist(
  input: { userId: string; watchlistId: string },
  db: Database = getDb(),
): Promise<{ deletedId: string }> {
  const deleted = await deleteUserWatchlist(input, db);

  if (!deleted) {
    throw new WatchlistError(
      "Watchlist was not found.",
      "WATCHLIST_NOT_FOUND",
      404,
    );
  }

  return { deletedId: input.watchlistId };
}

export async function addMarketToWatchlist(
  input: { userId: string; watchlistId: string; marketUniqueKey: string },
  db: Database = getDb(),
): Promise<WatchlistItem> {
  const parsed = parseWatchlistInput(addMarketToWatchlistInputSchema, input);
  const watchlist = await findActiveWatchlist(
    {
      userId: input.userId,
      watchlistId: parsed.watchlistId,
    },
    db,
  );

  if (!watchlist) {
    throw new WatchlistError(
      "Watchlist was not found.",
      "WATCHLIST_NOT_FOUND",
      404,
    );
  }

  const existingItem = await findActiveWatchlistItem(parsed, db);

  if (existingItem) {
    return existingItem;
  }

  try {
    return await createWatchlistItem(parsed, db);
  } catch (error) {
    const activeItem = await findActiveWatchlistItem(parsed, db);

    if (activeItem) {
      return activeItem;
    }

    throw mapRepositoryError(error);
  }
}

export async function removeMarketFromWatchlist(
  input: { userId: string; watchlistId: string; marketUniqueKey: string },
  db: Database = getDb(),
): Promise<{ watchlistId: string; marketUniqueKey: string }> {
  const parsed = parseWatchlistInput(
    removeMarketFromWatchlistInputSchema,
    input,
  );
  const watchlist = await findActiveWatchlist(
    {
      userId: input.userId,
      watchlistId: parsed.watchlistId,
    },
    db,
  );

  if (!watchlist) {
    throw new WatchlistError(
      "Watchlist was not found.",
      "WATCHLIST_NOT_FOUND",
      404,
    );
  }

  const removed = await removeWatchlistItem(parsed, db);

  if (!removed) {
    throw new WatchlistError(
      "Saved market was not found.",
      "WATCHLIST_ITEM_NOT_FOUND",
      404,
    );
  }

  return {
    watchlistId: parsed.watchlistId,
    marketUniqueKey: parsed.marketUniqueKey,
  };
}

export type { WatchlistDetail, WatchlistItem, WatchlistSummary };

function mapRepositoryError(error: unknown): Error {
  if (error instanceof WatchlistError) {
    return error;
  }

  if (isUniqueConstraintError(error)) {
    return new WatchlistError(
      "A watchlist with this name already exists.",
      "WATCHLIST_NAME_TAKEN",
      409,
    );
  }

  return error instanceof Error ? error : new Error("Watchlist operation failed.");
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

function parseWatchlistInput<TSchema extends z.ZodType>(
  schema: TSchema,
  input: unknown,
): z.infer<TSchema> {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new ApplicationValidationError("Invalid watchlist input.", {
      code: "WATCHLIST_VALIDATION_ERROR",
      details: result.error.issues,
    });
  }

  return result.data;
}
