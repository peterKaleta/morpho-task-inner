import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { CacheSetOptions, JsonCache } from "@/server/cache";

const secret = "test-session-secret-with-at-least-32-characters";
const serviceConfig = {
  MORPHO_API_CACHE_TTL: 31,
  MORPHO_API_URL: "https://api.morpho.org/graphql",
};

const market = {
  marketId: "0xmarket",
  chain: {
    id: 1,
    network: "ethereum",
  },
  loanAsset: {
    address: "0xloan",
    symbol: "USDC",
    decimals: 6,
  },
  collateralAsset: {
    address: "0xcollateral",
    symbol: "WETH",
    decimals: 18,
  },
  lltv: "860000000000000000",
  state: {
    supplyApy: 0.04,
    borrowApy: 0.07,
    totalLiquidity: "100000000",
    totalMarketSize: "200000000",
  },
};

describe("Morpho service methods", () => {
  beforeEach(() => {
    vi.stubEnv("DATABASE_URL", "postgres://user:pass@localhost:5432/test");
    vi.stubEnv("MORPHO_API_URL", "https://api.morpho.org/graphql");
    vi.stubEnv("SESSION_SECRET", secret);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns normalized market summaries", async () => {
    const { getMorphoMarkets } = await import("./get-morpho-markets");
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        void input;
        void init;

        return Response.json({
          data: {
            markets: {
              items: [market],
            },
          },
        });
      },
    );

    await expect(
      getMorphoMarkets({
        fetchFn: fetchMock as typeof fetch,
      }),
    ).resolves.toEqual([
      expect.objectContaining({
        marketId: "0xmarket",
        state: expect.objectContaining({
          totalMarketSize: "200000000",
        }),
      }),
    ]);
  });

  it("passes normalized search text to the market list query", async () => {
    const { getMorphoMarkets } = await import("./get-morpho-markets");
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        void input;
        void init;

        return Response.json({
          data: {
            markets: {
              items: [market],
            },
          },
        });
      },
    );

    await getMorphoMarkets({
      fetchFn: fetchMock as typeof fetch,
      search: "  usdc  ",
    });

    const [, init] = fetchMock.mock.calls[0] ?? [];

    expect(JSON.parse(init?.body as string).variables).toEqual({
      first: 100,
      search: "usdc",
      skip: 0,
    });
  });

  it("caches market list requests by normalized inputs", async () => {
    const { getMorphoMarkets } = await import("./get-morpho-markets");
    const cache = new MemoryJsonCache();
    const fetchMock = vi.fn(async () =>
      Response.json({
        data: {
          markets: {
            items: [market],
          },
        },
      }),
    );

    await getMorphoMarkets({
      cache,
      config: serviceConfig,
      fetchFn: fetchMock as typeof fetch,
      first: 20,
      search: "  usdc  ",
      skip: 0,
    });
    await getMorphoMarkets({
      cache,
      config: serviceConfig,
      fetchFn: fetchMock as typeof fetch,
      first: 20,
      search: "usdc",
      skip: 0,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(cache.setCalls).toEqual([
      expect.objectContaining({
        options: {
          ttlSeconds: 31,
        },
      }),
    ]);
  });

  it("returns a normalized market detail", async () => {
    const { getMorphoMarket } = await import("./get-morpho-market");
    const fetchMock = vi.fn(async () =>
      Response.json({
        data: {
          markets: {
            items: [market],
          },
        },
      }),
    );

    await expect(
      getMorphoMarket("0xmarket", {
        fetchFn: fetchMock as typeof fetch,
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        marketId: "0xmarket",
        state: expect.objectContaining({
          borrowApy: 0.07,
          totalLiquidity: "100000000",
        }),
      }),
    );
  });

  it("returns null when market detail is missing", async () => {
    const { getMorphoMarket } = await import("./get-morpho-market");
    const fetchMock = vi.fn(async () =>
      Response.json({
        data: {
          markets: {
            items: [],
          },
        },
      }),
    );

    await expect(
      getMorphoMarket("0xmissing", {
        fetchFn: fetchMock as typeof fetch,
      }),
    ).resolves.toBeNull();
  });

  it("caches market detail requests by normalized id", async () => {
    const { getMorphoMarket } = await import("./get-morpho-market");
    const cache = new MemoryJsonCache();
    const fetchMock = vi.fn(async () =>
      Response.json({
        data: {
          markets: {
            items: [market],
          },
        },
      }),
    );

    await getMorphoMarket("  0xmarket  ", {
      cache,
      config: serviceConfig,
      fetchFn: fetchMock as typeof fetch,
    });
    await getMorphoMarket("0xmarket", {
      cache,
      config: serviceConfig,
      fetchFn: fetchMock as typeof fetch,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(cache.setCalls).toEqual([
      expect.objectContaining({
        options: {
          ttlSeconds: 31,
        },
      }),
    ]);
  });

  it("does not cache missing market detail responses", async () => {
    const { getMorphoMarket } = await import("./get-morpho-market");
    const cache = new MemoryJsonCache();
    const fetchMock = vi.fn(async () =>
      Response.json({
        data: {
          markets: {
            items: [],
          },
        },
      }),
    );

    await expect(
      getMorphoMarket("0xmissing", {
        cache,
        config: serviceConfig,
        fetchFn: fetchMock as typeof fetch,
      }),
    ).resolves.toBeNull();
    await expect(
      getMorphoMarket("0xmissing", {
        cache,
        config: serviceConfig,
        fetchFn: fetchMock as typeof fetch,
      }),
    ).resolves.toBeNull();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(cache.setCalls).toEqual([]);
  });

  it("does not cache invalid market detail ids", async () => {
    const { getMorphoMarket } = await import("./get-morpho-market");
    const cache = new MemoryJsonCache();

    await expect(
      getMorphoMarket(" ", {
        cache,
        config: serviceConfig,
      }),
    ).rejects.toMatchObject({
      upstreamMessage: "Market id is required.",
    });
    expect(cache.getCalls).toEqual([]);
    expect(cache.setCalls).toEqual([]);
  });
});

class MemoryJsonCache implements JsonCache {
  readonly getCalls: string[] = [];
  readonly setCalls: Array<{
    key: string;
    options: CacheSetOptions;
    value: unknown;
  }> = [];
  private readonly values = new Map<string, unknown>();

  async get<T>(key: string): Promise<T | null> {
    this.getCalls.push(key);

    return (this.values.get(key) as T | undefined) ?? null;
  }

  async set<T>(
    key: string,
    value: T,
    options: CacheSetOptions,
  ): Promise<void> {
    this.setCalls.push({
      key,
      options,
      value,
    });
    this.values.set(key, value);
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
