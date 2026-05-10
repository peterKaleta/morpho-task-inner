import postgres from "postgres";

import { config } from "../config";

const sql = postgres(config.DATABASE_URL, {
  max: 1,
  prepare: false,
});

try {
  await sql`select 1 as ok`;
  console.log("Database connection OK");
} finally {
  await sql.end();
}
