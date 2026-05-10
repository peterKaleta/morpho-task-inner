import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  emptyStringToUndefined,
  type EnvSource,
  nonEmptyString,
  optionalString,
  optionalUrlString,
  urlString,
  z,
} from "@pk-task/shared/text-helpers";

const appDir = dirname(fileURLToPath(import.meta.url));

loadEnvFile(resolve(appDir, ".env.local"));
loadEnvFile(resolve(appDir, ".env"));

export const configSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: urlString,
  REDIS_URL: optionalUrlString,
  UPSTASH_REDIS_REST_URL: optionalUrlString,
  UPSTASH_REDIS_REST_TOKEN: optionalString,
  MORPHO_API_URL: urlString,
  SESSION_SECRET: nonEmptyString.min(32),
  AUTH_NONCE_TTL_SECONDS: z
    .preprocess(emptyStringToUndefined, z.coerce.number().int().min(60).max(1800))
    .default(600),
});

export type Config = z.infer<typeof configSchema>;

export function readEnv(env: EnvSource): Config {
  return configSchema.parse(env);
}

export const config = readEnv(process.env);

function loadEnvFile(path: string): void {
  if (!existsSync(path)) {
    return;
  }

  const lines = readFileSync(path, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = unquoteEnvValue(trimmedLine.slice(separatorIndex + 1).trim());

    process.env[key] ??= value;
  }
}

function unquoteEnvValue(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
