import { afterEach, describe, expect, it, vi } from "vitest";

import { createJsonCache, type RedisStringCacheClient } from "./redis-cache";

class FakeRedisClient implements RedisStringCacheClient {
  readonly values = new Map<string, string>();
  readonly setCalls: Array<{
    key: string;
    options: { ttlSeconds: number };
    value: string;
  }> = [];
  getError: unknown;
  setError: unknown;

  async get(key: string): Promise<string | null> {
    if (this.getError) {
      throw this.getError;
    }

    return this.values.get(key) ?? null;
  }

  async set(
    key: string,
    value: string,
    options: { ttlSeconds: number },
  ): Promise<void> {
    if (this.setError) {
      throw this.setError;
    }

    this.setCalls.push({
      key,
      options,
      value,
    });
    this.values.set(key, value);
  }
}

describe("createJsonCache", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns cached JSON without calling the loader", async () => {
    const redis = new FakeRedisClient();
    const cache = createJsonCache(redis);
    const loader = vi.fn(async () => ({ value: "fresh" }));

    redis.values.set("key", JSON.stringify({ value: "cached" }));

    await expect(
      cache.getOrSet("key", { ttlSeconds: 45 }, loader),
    ).resolves.toEqual({ value: "cached" });
    expect(loader).not.toHaveBeenCalled();
  });

  it("loads and writes fresh values on cache miss", async () => {
    const redis = new FakeRedisClient();
    const cache = createJsonCache(redis);

    await expect(
      cache.getOrSet("key", { ttlSeconds: 45 }, async () => ({
        value: "fresh",
      })),
    ).resolves.toEqual({ value: "fresh" });
    expect(redis.setCalls).toEqual([
      {
        key: "key",
        options: {
          ttlSeconds: 45,
        },
        value: JSON.stringify({ value: "fresh" }),
      },
    ]);
  });

  it("bypasses cache reads that fail", async () => {
    const redis = new FakeRedisClient();
    const cache = createJsonCache(redis);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    redis.getError = new Error("read failed");

    await expect(
      cache.getOrSet("key", { ttlSeconds: 45 }, async () => ({
        value: "fresh",
      })),
    ).resolves.toEqual({ value: "fresh" });
    expect(warnSpy).toHaveBeenCalledWith(
      "[cache] Redis cache read failed. Bypassing cache.",
      redis.getError,
    );
  });

  it("returns fresh values when cache writes fail", async () => {
    const redis = new FakeRedisClient();
    const cache = createJsonCache(redis);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    redis.setError = new Error("write failed");

    await expect(
      cache.getOrSet("key", { ttlSeconds: 45 }, async () => ({
        value: "fresh",
      })),
    ).resolves.toEqual({ value: "fresh" });
    expect(warnSpy).toHaveBeenCalledWith(
      "[cache] Redis cache write failed. Bypassing cache.",
      redis.setError,
    );
  });

  it("treats malformed JSON as a cache miss", async () => {
    const redis = new FakeRedisClient();
    const cache = createJsonCache(redis);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    redis.values.set("key", "{");

    await expect(
      cache.getOrSet("key", { ttlSeconds: 45 }, async () => ({
        value: "fresh",
      })),
    ).resolves.toEqual({ value: "fresh" });
    expect(warnSpy).toHaveBeenCalledWith(
      "[cache] Redis cache contained invalid JSON. Bypassing cache.",
      expect.any(SyntaxError),
    );
  });
});
