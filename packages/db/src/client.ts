import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";

import { config } from "../config";
import * as schema from "./schema";

export type Database = PostgresJsDatabase<typeof schema>;

export type DatabaseConnection = {
  db: Database;
  sql: Sql;
  close: () => Promise<void>;
};

let cachedConnection: DatabaseConnection | undefined;

export function createDatabaseConnection(
  databaseUrl = config.DATABASE_URL,
): DatabaseConnection {
  const sqlClient = postgres(databaseUrl, {
    max: 1,
    prepare: false,
  });

  return {
    db: drizzle(sqlClient, { schema }),
    sql: sqlClient,
    close: () => sqlClient.end(),
  };
}

export function getDb(): Database {
  cachedConnection ??= createDatabaseConnection();

  return cachedConnection.db;
}

export async function closeDb(): Promise<void> {
  if (!cachedConnection) {
    return;
  }

  await cachedConnection.close();
  cachedConnection = undefined;
}
