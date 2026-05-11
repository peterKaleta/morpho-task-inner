import {
  and,
  desc,
  eq,
  getDb,
  isNull,
  sql,
  watchlistItems,
  watchlists,
  type Database,
} from "@pk-task/db";

import type {
  WatchlistDetail,
  WatchlistItem,
  WatchlistSummary,
} from "./types";

function toIsoString(value: Date): string {
  return value.toISOString();
}

export async function listUserWatchlists(
  userId: string,
  db: Database = getDb(),
): Promise<WatchlistSummary[]> {
  const rows = await db
    .select({
      id: watchlists.id,
      name: watchlists.name,
      description: watchlists.description,
      createdAt: watchlists.createdAt,
      updatedAt: watchlists.updatedAt,
      itemCount: sql<number>`cast(count(${watchlistItems.id}) as int)`,
    })
    .from(watchlists)
    .leftJoin(
      watchlistItems,
      and(
        eq(watchlistItems.watchlistId, watchlists.id),
        isNull(watchlistItems.deletedAt),
      ),
    )
    .where(and(eq(watchlists.userId, userId), isNull(watchlists.deletedAt)))
    .groupBy(
      watchlists.id,
      watchlists.name,
      watchlists.description,
      watchlists.createdAt,
      watchlists.updatedAt,
    )
    .orderBy(desc(watchlists.updatedAt), desc(watchlists.createdAt));

  return rows.map((row) => ({
    ...row,
    createdAt: toIsoString(row.createdAt),
    updatedAt: toIsoString(row.updatedAt),
  }));
}

export async function getUserWatchlist(
  input: { userId: string; watchlistId: string },
  db: Database = getDb(),
): Promise<WatchlistDetail | null> {
  const [watchlist] = await db
    .select({
      id: watchlists.id,
      name: watchlists.name,
      description: watchlists.description,
      createdAt: watchlists.createdAt,
      updatedAt: watchlists.updatedAt,
    })
    .from(watchlists)
    .where(
      and(
        eq(watchlists.id, input.watchlistId),
        eq(watchlists.userId, input.userId),
        isNull(watchlists.deletedAt),
      ),
    )
    .limit(1);

  if (!watchlist) {
    return null;
  }

  const items = await listWatchlistItems(input.watchlistId, db);

  return {
    ...watchlist,
    items,
    createdAt: toIsoString(watchlist.createdAt),
    updatedAt: toIsoString(watchlist.updatedAt),
  };
}

export async function createUserWatchlist(
  input: {
    userId: string;
    name: string;
    description: string | null;
  },
  db: Database = getDb(),
): Promise<WatchlistSummary> {
  const [watchlist] = await db
    .insert(watchlists)
    .values({
      userId: input.userId,
      name: input.name,
      description: input.description,
    })
    .returning({
      id: watchlists.id,
      name: watchlists.name,
      description: watchlists.description,
      createdAt: watchlists.createdAt,
      updatedAt: watchlists.updatedAt,
    });

  if (!watchlist) {
    throw new Error("Could not create watchlist.");
  }

  return {
    ...watchlist,
    itemCount: 0,
    createdAt: toIsoString(watchlist.createdAt),
    updatedAt: toIsoString(watchlist.updatedAt),
  };
}

export async function updateUserWatchlist(
  input: {
    userId: string;
    watchlistId: string;
    name: string;
    description: string | null;
  },
  db: Database = getDb(),
): Promise<WatchlistSummary | null> {
  const now = new Date();
  const [watchlist] = await db
    .update(watchlists)
    .set({
      name: input.name,
      description: input.description,
      updatedAt: now,
    })
    .where(
      and(
        eq(watchlists.id, input.watchlistId),
        eq(watchlists.userId, input.userId),
        isNull(watchlists.deletedAt),
      ),
    )
    .returning({
      id: watchlists.id,
      name: watchlists.name,
      description: watchlists.description,
      createdAt: watchlists.createdAt,
      updatedAt: watchlists.updatedAt,
    });

  if (!watchlist) {
    return null;
  }

  const [summary] = await listUserWatchlists(input.userId, db).then((rows) =>
    rows.filter((row) => row.id === input.watchlistId),
  );

  return (
    summary ?? {
      ...watchlist,
      itemCount: 0,
      createdAt: toIsoString(watchlist.createdAt),
      updatedAt: toIsoString(watchlist.updatedAt),
    }
  );
}

export async function deleteUserWatchlist(
  input: { userId: string; watchlistId: string },
  db: Database = getDb(),
): Promise<boolean> {
  const now = new Date();
  const [watchlist] = await db
    .update(watchlists)
    .set({
      deletedAt: now,
      updatedAt: now,
    })
    .where(
      and(
        eq(watchlists.id, input.watchlistId),
        eq(watchlists.userId, input.userId),
        isNull(watchlists.deletedAt),
      ),
    )
    .returning({ id: watchlists.id });

  if (!watchlist) {
    return false;
  }

  await db
    .update(watchlistItems)
    .set({
      deletedAt: now,
      updatedAt: now,
    })
    .where(
      and(
        eq(watchlistItems.watchlistId, input.watchlistId),
        isNull(watchlistItems.deletedAt),
      ),
    );

  return true;
}

export async function findActiveWatchlist(
  input: { userId: string; watchlistId: string },
  db: Database = getDb(),
): Promise<{ id: string } | null> {
  const [watchlist] = await db
    .select({ id: watchlists.id })
    .from(watchlists)
    .where(
      and(
        eq(watchlists.id, input.watchlistId),
        eq(watchlists.userId, input.userId),
        isNull(watchlists.deletedAt),
      ),
    )
    .limit(1);

  return watchlist ?? null;
}

export async function findActiveWatchlistItem(
  input: { watchlistId: string; marketUniqueKey: string },
  db: Database = getDb(),
): Promise<WatchlistItem | null> {
  const [item] = await db
    .select({
      id: watchlistItems.id,
      watchlistId: watchlistItems.watchlistId,
      marketUniqueKey: watchlistItems.marketUniqueKey,
      createdAt: watchlistItems.createdAt,
    })
    .from(watchlistItems)
    .where(
      and(
        eq(watchlistItems.watchlistId, input.watchlistId),
        eq(watchlistItems.marketUniqueKey, input.marketUniqueKey),
        isNull(watchlistItems.deletedAt),
      ),
    )
    .limit(1);

  return item
    ? {
        ...item,
        createdAt: toIsoString(item.createdAt),
      }
    : null;
}

export async function createWatchlistItem(
  input: { watchlistId: string; marketUniqueKey: string },
  db: Database = getDb(),
): Promise<WatchlistItem> {
  const now = new Date();
  const [item] = await db
    .insert(watchlistItems)
    .values({
      watchlistId: input.watchlistId,
      marketUniqueKey: input.marketUniqueKey,
      updatedAt: now,
    })
    .returning({
      id: watchlistItems.id,
      watchlistId: watchlistItems.watchlistId,
      marketUniqueKey: watchlistItems.marketUniqueKey,
      createdAt: watchlistItems.createdAt,
    });

  if (!item) {
    throw new Error("Could not add market to watchlist.");
  }

  await touchWatchlist(input.watchlistId, db, now);

  return {
    ...item,
    createdAt: toIsoString(item.createdAt),
  };
}

export async function removeWatchlistItem(
  input: { watchlistId: string; marketUniqueKey: string },
  db: Database = getDb(),
): Promise<boolean> {
  const now = new Date();
  const [item] = await db
    .update(watchlistItems)
    .set({
      deletedAt: now,
      updatedAt: now,
    })
    .where(
      and(
        eq(watchlistItems.watchlistId, input.watchlistId),
        eq(watchlistItems.marketUniqueKey, input.marketUniqueKey),
        isNull(watchlistItems.deletedAt),
      ),
    )
    .returning({ id: watchlistItems.id });

  if (!item) {
    return false;
  }

  await touchWatchlist(input.watchlistId, db, now);

  return true;
}

async function listWatchlistItems(
  watchlistId: string,
  db: Database,
): Promise<WatchlistItem[]> {
  const items = await db
    .select({
      id: watchlistItems.id,
      watchlistId: watchlistItems.watchlistId,
      marketUniqueKey: watchlistItems.marketUniqueKey,
      createdAt: watchlistItems.createdAt,
    })
    .from(watchlistItems)
    .where(
      and(
        eq(watchlistItems.watchlistId, watchlistId),
        isNull(watchlistItems.deletedAt),
      ),
    )
    .orderBy(desc(watchlistItems.createdAt));

  return items.map((item) => ({
    ...item,
    createdAt: toIsoString(item.createdAt),
  }));
}

async function touchWatchlist(
  watchlistId: string,
  db: Database,
  now = new Date(),
): Promise<void> {
  await db
    .update(watchlists)
    .set({ updatedAt: now })
    .where(eq(watchlists.id, watchlistId));
}
