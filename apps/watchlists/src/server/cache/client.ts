import { Redis as UpstashRedis } from "@upstash/redis";
import { createClient, type RedisClientType } from "redis";

import { config as defaultConfig, type Config } from "../../../config-server";

import { createJsonCache, type RedisStringCacheClient } from "./redis-cache";
import type { CacheSetOptions, JsonCache } from "./types";

type CacheConfig = Pick<
  Config,
  | "NODE_ENV"
  | "REDIS_URL"
  | "UPSTASH_REDIS_REST_TOKEN"
  | "UPSTASH_REDIS_REST_URL"
>;

let defaultCache: JsonCache | null | undefined;

export function getJsonCache(): JsonCache | null {
  if (defaultCache !== undefined) {
    return defaultCache;
  }

  defaultCache =
    defaultConfig.NODE_ENV === "test"
      ? null
      : createConfiguredJsonCache(defaultConfig);

  return defaultCache;
}

export function createConfiguredJsonCache(config: CacheConfig): JsonCache | null {
  if (config.UPSTASH_REDIS_REST_URL && config.UPSTASH_REDIS_REST_TOKEN) {
    return createJsonCache(
      new UpstashRedisStringCacheClient({
        token: config.UPSTASH_REDIS_REST_TOKEN,
        url: config.UPSTASH_REDIS_REST_URL,
      }),
    );
  }

  if (config.REDIS_URL) {
    return createJsonCache(new LocalRedisStringCacheClient(config.REDIS_URL));
  }

  return null;
}

export function resetJsonCacheForTests(): void {
  defaultCache = undefined;
}

class UpstashRedisStringCacheClient implements RedisStringCacheClient {
  private readonly redis: UpstashRedis;

  constructor(options: { token: string; url: string }) {
    this.redis = new UpstashRedis({
      ...options,
      automaticDeserialization: false,
    });
  }

  async get(key: string): Promise<string | null> {
    const value = await this.redis.get<string>(key);

    return typeof value === "string" ? value : null;
  }

  async set(
    key: string,
    value: string,
    options: CacheSetOptions,
  ): Promise<void> {
    await this.redis.set(key, value, {
      ex: options.ttlSeconds,
    });
  }
}

class LocalRedisStringCacheClient implements RedisStringCacheClient {
  private clientPromise: Promise<RedisClientType> | null = null;

  constructor(private readonly url: string) {}

  async get(key: string): Promise<string | null> {
    return await (await this.getClient()).get(key);
  }

  async set(
    key: string,
    value: string,
    options: CacheSetOptions,
  ): Promise<void> {
    await (await this.getClient()).set(key, value, {
      EX: options.ttlSeconds,
    });
  }

  private getClient(): Promise<RedisClientType> {
    this.clientPromise ??= this.connect();

    return this.clientPromise;
  }

  private async connect(): Promise<RedisClientType> {
    const client = createClient({
      url: this.url,
    });

    client.on("error", (error) => {
      console.warn("[cache] Redis client error.", error);
    });

    await client.connect();

    return client as RedisClientType;
  }
}
