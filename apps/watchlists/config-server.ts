import {
  emptyStringToUndefined,
  type EnvSource,
  nonEmptyString,
  optionalString,
  optionalUrlString,
  urlString,
  z,
} from "@pk-task/shared/text-helpers";

export const configSchema = z.object({
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
