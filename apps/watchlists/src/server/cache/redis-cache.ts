import type { CacheSetOptions, JsonCache } from "./types";

export type RedisStringCacheClient = {
  get(key: string): Promise<string | null>;
  set(
    key: string,
    value: string,
    options: CacheSetOptions,
  ): Promise<void>;
};

export function createJsonCache(client: RedisStringCacheClient): JsonCache {
  return new RedisJsonCache(client);
}

class RedisJsonCache implements JsonCache {
  constructor(private readonly client: RedisStringCacheClient) {}

  async get<T>(key: string): Promise<T | null> {
    let cachedValue: string | null;

    try {
      cachedValue = await this.client.get(key);
    } catch (error) {
      warnCacheBypass("Redis cache read failed.", error);
      return null;
    }

    if (cachedValue === null) {
      return null;
    }

    try {
      return JSON.parse(cachedValue) as T;
    } catch (error) {
      warnCacheBypass("Redis cache contained invalid JSON.", error);
      return null;
    }
  }

  async set<T>(
    key: string,
    value: T,
    options: CacheSetOptions,
  ): Promise<void> {
    try {
      await this.client.set(key, JSON.stringify(value), options);
    } catch (error) {
      warnCacheBypass("Redis cache write failed.", error);
    }
  }

  async getOrSet<T>(
    key: string,
    options: CacheSetOptions,
    load: () => Promise<T>,
  ): Promise<T> {
    const cachedValue = await this.get<T>(key);

    if (cachedValue !== null) {
      return cachedValue;
    }

    const freshValue = await load();
    await this.set(key, freshValue, options);

    return freshValue;
  }
}

function warnCacheBypass(message: string, error: unknown): void {
  console.warn(`[cache] ${message} Bypassing cache.`, error);
}
