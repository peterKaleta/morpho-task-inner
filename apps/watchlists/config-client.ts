import { type EnvSource, optionalString, z } from "@pk-task/shared/text-helpers";

export const configSchema = z.object({
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: optionalString,
});

export type Config = z.infer<typeof configSchema>;

export function readEnv(env: EnvSource): Config {
  return configSchema.parse(env);
}

export const config = readEnv({
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
});
