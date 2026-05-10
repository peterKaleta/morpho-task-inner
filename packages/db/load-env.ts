import { config as loadDotenv } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = dirname(fileURLToPath(import.meta.url));

loadDotenv({
  path: resolve(packageDir, ".env"),
  override: true,
  quiet: true,
});

loadDotenv({
  path: resolve(packageDir, ".env.local"),
  override: true,
  quiet: true,
});
