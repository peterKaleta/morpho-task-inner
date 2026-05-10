import { sql } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const primaryId = () => uuid("id").primaryKey().defaultRandom();
const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();
const deletedAt = () => timestamp("deleted_at", { withTimezone: true });

export const users = pgTable(
  "users",
  {
    id: primaryId(),
    walletAddress: text("wallet_address").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    deletedAt: deletedAt(),
  },
  (table) => [uniqueIndex("users_wallet_address_unique").on(table.walletAddress)],
);

export const authNonces = pgTable(
  "auth_nonces",
  {
    id: primaryId(),
    walletAddress: text("wallet_address").notNull(),
    nonce: text("nonce").notNull(),
    message: text("message").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("auth_nonces_nonce_unique").on(table.nonce),
    index("auth_nonces_wallet_address_idx").on(table.walletAddress),
    index("auth_nonces_expires_at_idx").on(table.expiresAt),
  ],
);

export const watchlists = pgTable(
  "watchlists",
  {
    id: primaryId(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (table) => [
    index("watchlists_user_id_idx").on(table.userId),
    uniqueIndex("watchlists_active_user_id_name_unique")
      .on(table.userId, table.name)
      .where(sql`${table.deletedAt} is null`),
  ],
);

export const watchlistItems = pgTable(
  "watchlist_items",
  {
    id: primaryId(),
    watchlistId: uuid("watchlist_id")
      .notNull()
      .references(() => watchlists.id),
    marketUniqueKey: text("market_unique_key").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (table) => [
    index("watchlist_items_watchlist_id_idx").on(table.watchlistId),
    index("watchlist_items_market_unique_key_idx").on(table.marketUniqueKey),
    uniqueIndex("watchlist_items_active_watchlist_id_market_unique_key_unique")
      .on(table.watchlistId, table.marketUniqueKey)
      .where(sql`${table.deletedAt} is null`),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AuthNonce = typeof authNonces.$inferSelect;
export type NewAuthNonce = typeof authNonces.$inferInsert;
export type Watchlist = typeof watchlists.$inferSelect;
export type NewWatchlist = typeof watchlists.$inferInsert;
export type WatchlistItem = typeof watchlistItems.$inferSelect;
export type NewWatchlistItem = typeof watchlistItems.$inferInsert;
