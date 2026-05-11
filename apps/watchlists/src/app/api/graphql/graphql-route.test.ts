import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

describe("GraphQL market endpoint", () => {
  beforeEach(() => {
    vi.stubEnv("DATABASE_URL", "postgres://user:pass@localhost:5432/test");
    vi.stubEnv("MORPHO_API_URL", "https://api.morpho.org/graphql");
    vi.stubEnv(
      "SESSION_SECRET",
      "test-session-secret-with-at-least-32-characters",
    );
  });

  afterEach(() => {
    vi.doUnmock("@/server/auth/current-user");
    vi.doUnmock("@/server/morpho-api/service");
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns markets from the Morpho service", async () => {
    const getMorphoMarkets = vi.fn(async () => [market]);
    const getMorphoMarket = vi.fn();
    vi.doMock("@/server/auth/current-user", () => ({
      getCurrentUser: vi.fn(async () => null),
    }));
    vi.doMock("@/server/morpho-api/service", () => ({
      getMorphoMarket,
      getMorphoMarkets,
    }));

    const response = await postGraphql(`
      query {
        markets {
          marketId
          loanAsset {
            symbol
          }
          state {
            totalMarketSize
          }
        }
      }
    `);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.errors).toBeUndefined();
    expect(body.data.markets).toEqual([
      {
        marketId: "0xmarket",
        loanAsset: {
          symbol: "USDC",
        },
        state: {
          totalMarketSize: "200000000",
        },
      },
    ]);
    expect(getMorphoMarkets).toHaveBeenCalledWith({
      first: undefined,
      search: undefined,
      skip: undefined,
    });
  });

  it("passes search and pagination args to market list reads", async () => {
    const getMorphoMarkets = vi.fn(async () => [market]);
    vi.doMock("@/server/auth/current-user", () => ({
      getCurrentUser: vi.fn(async () => null),
    }));
    vi.doMock("@/server/morpho-api/service", () => ({
      getMorphoMarket: vi.fn(),
      getMorphoMarkets,
    }));

    const response = await postGraphql(
      `
        query Markets($first: Int, $search: String, $skip: Int) {
          markets(first: $first, search: $search, skip: $skip) {
            marketId
          }
        }
      `,
      { first: 20, search: "usdc", skip: 40 },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.errors).toBeUndefined();
    expect(getMorphoMarkets).toHaveBeenCalledWith({
      first: 20,
      search: "usdc",
      skip: 40,
    });
  });

  it("returns market detail from the Morpho service", async () => {
    const getMorphoMarket = vi.fn(async () => market);
    vi.doMock("@/server/auth/current-user", () => ({
      getCurrentUser: vi.fn(async () => null),
    }));
    vi.doMock("@/server/morpho-api/service", () => ({
      getMorphoMarket,
      getMorphoMarkets: vi.fn(),
    }));

    const response = await postGraphql(
      `
        query Market($marketId: ID!) {
          market(marketId: $marketId) {
            marketId
            collateralAsset {
              symbol
            }
          }
        }
      `,
      { marketId: "0xmarket" },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.errors).toBeUndefined();
    expect(body.data.market).toEqual({
      marketId: "0xmarket",
      collateralAsset: {
        symbol: "WETH",
      },
    });
    expect(getMorphoMarket).toHaveBeenCalledWith("0xmarket");
  });

  it("returns null when market detail is missing", async () => {
    vi.doMock("@/server/auth/current-user", () => ({
      getCurrentUser: vi.fn(async () => null),
    }));
    vi.doMock("@/server/morpho-api/service", () => ({
      getMorphoMarket: vi.fn(async () => null),
      getMorphoMarkets: vi.fn(),
    }));

    const response = await postGraphql(
      `
        query Market($marketId: ID!) {
          market(marketId: $marketId) {
            marketId
          }
        }
      `,
      { marketId: "0xmissing" },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.errors).toBeUndefined();
    expect(body.data.market).toBeNull();
  });

  it("returns a stable error code for Morpho API failures", async () => {
    const { MorphoApiError } = await import("@/server/morpho-api/errors");
    vi.doMock("@/server/auth/current-user", () => ({
      getCurrentUser: vi.fn(async () => null),
    }));
    vi.doMock("@/server/morpho-api/service", () => ({
      getMorphoMarket: vi.fn(),
      getMorphoMarkets: vi.fn(async () => {
        throw new MorphoApiError("Upstream failed.", { status: 502 });
      }),
    }));

    const response = await postGraphql(`
      query {
        markets {
          marketId
        }
      }
    `);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toBeNull();
    expect(body.errors[0].message).toBe(
      "Unable to load Morpho market data right now.",
    );
    expect(body.errors[0].extensions.code).toBe("MORPHO_MARKET_DATA_ERROR");
  });
});

describe("GraphQL context", () => {
  afterEach(() => {
    vi.doUnmock("@/server/auth/current-user");
    vi.resetModules();
  });

  it("returns a null current user for anonymous requests", async () => {
    vi.doMock("@/server/auth/current-user", () => ({
      getCurrentUser: vi.fn(async () => null),
    }));
    const { createGraphqlContext } = await import("@/server/graphql/context");

    await expect(
      createGraphqlContext(new Request("http://localhost/api/graphql")),
    ).resolves.toEqual({
      currentUser: null,
    });
  });

  it("returns the current user from a signed request", async () => {
    vi.doMock("@/server/auth/current-user", () => ({
      getCurrentUser: vi.fn(async () => ({
        id: "00000000-0000-4000-8000-000000000001",
        walletAddress: "0x0000000000000000000000000000000000000001",
      })),
    }));
    const { createGraphqlContext } = await import("@/server/graphql/context");

    await expect(
      createGraphqlContext(new Request("http://localhost/api/graphql")),
    ).resolves.toEqual({
      currentUser: {
        id: "00000000-0000-4000-8000-000000000001",
        walletAddress: "0x0000000000000000000000000000000000000001",
      },
    });
  });
});

async function postGraphql(
  query: string,
  variables?: Record<string, unknown>,
): Promise<Response> {
  const { POST } = await import("./route");

  return POST(
    new Request("http://localhost/api/graphql", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    }),
  );
}
