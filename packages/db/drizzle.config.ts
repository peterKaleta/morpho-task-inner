import { defineConfig } from "drizzle-kit";

import { config } from "./config";

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: config.DATABASE_URL,
  },
  strict: true,
  verbose: true,
});
