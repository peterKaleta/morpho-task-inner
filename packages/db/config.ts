import { type EnvSource, urlString, z } from "@pk-task/shared/text-helpers";

import "./load-env";

export const configSchema = z.object({
  DATABASE_URL: urlString,
});

export type Config = z.infer<typeof configSchema>;

export function readEnv(env: EnvSource): Config {
  return configSchema.parse(env);
}

export const config = readEnv(process.env);
