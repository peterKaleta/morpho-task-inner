import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const secret = "test-session-secret-with-at-least-32-characters";

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
  lltv: 0.86,
  state: {
    supplyApy: 0.04,
    borrowApy: 0.07,
    utilization: 0.6,
    liquidityAssetsUsd: 100,
    supplyAssetsUsd: 200,
    borrowAssetsUsd: 120,
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
      getMorphoMarkets({
        fetchFn: fetchMock as typeof fetch,
      }),
    ).resolves.toEqual([
      expect.objectContaining({
        marketId: "0xmarket",
        state: expect.objectContaining({
          supplyAssetsUsd: 200,
        }),
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
          supplyAssetsUsd: 200,
          borrowAssetsUsd: 120,
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
});
