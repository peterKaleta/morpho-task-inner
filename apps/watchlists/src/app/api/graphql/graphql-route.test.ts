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
    vi.doUnmock("@/server/services/auth/current-user");
    vi.doUnmock("@/server/services/markets/service");
    vi.doUnmock("@/server/services/watchlists");
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns markets from the Morpho service", async () => {
    const getMorphoMarkets = vi.fn(async () => [market]);
    const getMorphoMarket = vi.fn();
    vi.doMock("@/server/services/auth/current-user", () => ({
      getCurrentUser: vi.fn(async () => null),
    }));
    vi.doMock("@/server/services/markets/service", () => ({
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
    vi.doMock("@/server/services/auth/current-user", () => ({
      getCurrentUser: vi.fn(async () => null),
    }));
    vi.doMock("@/server/services/markets/service", () => ({
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
    vi.doMock("@/server/services/auth/current-user", () => ({
      getCurrentUser: vi.fn(async () => null),
    }));
    vi.doMock("@/server/services/markets/service", () => ({
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

  it("returns signed-in market watchlist counts", async () => {
    const getMorphoMarkets = vi.fn(async () => [market]);
    const countUserWatchlistsContainingMarket = vi.fn(async () => 2);
    vi.doMock("@/server/services/auth/current-user", () => ({
      getCurrentUser: vi.fn(async () => currentUser),
    }));
    vi.doMock("@/server/services/markets/service", () => ({
      getMorphoMarket: vi.fn(),
      getMorphoMarkets,
    }));
    vi.doMock("@/server/services/watchlists", () => ({
      countUserWatchlistsContainingMarket,
    }));

    const response = await postGraphql(`
      query {
        markets {
          marketId
          watchlistCount
        }
      }
    `);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.errors).toBeUndefined();
    expect(body.data.markets).toEqual([
      {
        marketId: "0xmarket",
        watchlistCount: 2,
      },
    ]);
    expect(countUserWatchlistsContainingMarket).toHaveBeenCalledWith({
      userId: currentUser.id,
      marketUniqueKey: "0xmarket",
    });
  });

  it("returns null when market detail is missing", async () => {
    vi.doMock("@/server/services/auth/current-user", () => ({
      getCurrentUser: vi.fn(async () => null),
    }));
    vi.doMock("@/server/services/markets/service", () => ({
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
    const { MorphoApiError } = await import("@/server/services/markets/errors");
    vi.doMock("@/server/services/auth/current-user", () => ({
      getCurrentUser: vi.fn(async () => null),
    }));
    vi.doMock("@/server/services/markets/service", () => ({
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

describe("GraphQL watchlist endpoint", () => {
  beforeEach(() => {
    vi.stubEnv("DATABASE_URL", "postgres://user:pass@localhost:5432/test");
    vi.stubEnv("MORPHO_API_URL", "https://api.morpho.org/graphql");
    vi.stubEnv(
      "SESSION_SECRET",
      "test-session-secret-with-at-least-32-characters",
    );
  });

  afterEach(() => {
    vi.doUnmock("@/server/services/auth/current-user");
    vi.doUnmock("@/server/services/markets/service");
    vi.doUnmock("@/server/services/watchlists");
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("rejects unauthenticated watchlist reads", async () => {
    vi.doMock("@/server/services/auth/current-user", () => ({
      getCurrentUser: vi.fn(async () => null),
    }));
    vi.doMock("@/server/services/markets/service", () => ({
      getMorphoMarket: vi.fn(),
      getMorphoMarkets: vi.fn(),
    }));
    vi.doMock("@/server/services/watchlists", () => ({
      listUserWatchlists: vi.fn(),
    }));

    const response = await postGraphql(`
      query {
        myWatchlists {
          id
        }
      }
    `);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toBeNull();
    expect(body.errors[0].extensions.code).toBe("UNAUTHENTICATED");
  });

  it("returns watchlists for the signed-in user", async () => {
    const listUserWatchlists = vi.fn(async () => [
      {
        id: "00000000-0000-4000-8000-000000000101",
        name: "Blue chips",
        description: "Main markets",
        itemCount: 2,
        marketUniqueKeys: ["0xmarket", "0xother"],
        createdAt: "2026-05-11T08:00:00.000Z",
        updatedAt: "2026-05-11T08:00:00.000Z",
      },
    ]);
    vi.doMock("@/server/services/auth/current-user", () => ({
      getCurrentUser: vi.fn(async () => currentUser),
    }));
    vi.doMock("@/server/services/markets/service", () => ({
      getMorphoMarket: vi.fn(),
      getMorphoMarkets: vi.fn(),
    }));
    vi.doMock("@/server/services/watchlists", () => ({
      listUserWatchlists,
    }));

    const response = await postGraphql(`
      query {
        myWatchlists {
          id
          name
          itemCount
          marketUniqueKeys
        }
      }
    `);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.errors).toBeUndefined();
    expect(body.data.myWatchlists).toEqual([
      {
        id: "00000000-0000-4000-8000-000000000101",
        name: "Blue chips",
        itemCount: 2,
        marketUniqueKeys: ["0xmarket", "0xother"],
      },
    ]);
    expect(listUserWatchlists).toHaveBeenCalledWith(currentUser.id);
  });

  it("hydrates saved markets without failing unavailable rows", async () => {
    const getUserWatchlist = vi.fn(async () => ({
      id: "00000000-0000-4000-8000-000000000101",
      name: "Blue chips",
      description: null,
      createdAt: "2026-05-11T08:00:00.000Z",
      updatedAt: "2026-05-11T08:00:00.000Z",
      items: [
        {
          id: "00000000-0000-4000-8000-000000000201",
          watchlistId: "00000000-0000-4000-8000-000000000101",
          marketUniqueKey: "0xmarket",
          createdAt: "2026-05-11T08:00:00.000Z",
        },
        {
          id: "00000000-0000-4000-8000-000000000202",
          watchlistId: "00000000-0000-4000-8000-000000000101",
          marketUniqueKey: "0xmissing",
          createdAt: "2026-05-11T08:01:00.000Z",
        },
      ],
    }));
    const getMorphoMarket = vi.fn(async (marketId: string) => {
      if (marketId === "0xmarket") {
        return market;
      }

      throw new Error("Unavailable");
    });
    vi.doMock("@/server/services/auth/current-user", () => ({
      getCurrentUser: vi.fn(async () => currentUser),
    }));
    vi.doMock("@/server/services/markets/service", () => ({
      getMorphoMarket,
      getMorphoMarkets: vi.fn(),
    }));
    vi.doMock("@/server/services/watchlists", () => ({
      getUserWatchlist,
    }));

    const response = await postGraphql(
      `
        query Watchlist($id: ID!) {
          watchlist(id: $id) {
            id
            items {
              marketUniqueKey
              market {
                marketId
              }
            }
          }
        }
      `,
      { id: "00000000-0000-4000-8000-000000000101" },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.errors).toBeUndefined();
    expect(body.data.watchlist.items).toEqual([
      {
        marketUniqueKey: "0xmarket",
        market: {
          marketId: "0xmarket",
        },
      },
      {
        marketUniqueKey: "0xmissing",
        market: null,
      },
    ]);
    expect(getUserWatchlist).toHaveBeenCalledWith({
      userId: currentUser.id,
      watchlistId: "00000000-0000-4000-8000-000000000101",
    });
  });

  it("creates watchlists for the signed-in user", async () => {
    const createWatchlist = vi.fn(async () => ({
      id: "00000000-0000-4000-8000-000000000101",
      name: "New list",
      description: null,
      itemCount: 0,
      createdAt: "2026-05-11T08:00:00.000Z",
      updatedAt: "2026-05-11T08:00:00.000Z",
    }));
    vi.doMock("@/server/services/auth/current-user", () => ({
      getCurrentUser: vi.fn(async () => currentUser),
    }));
    vi.doMock("@/server/services/markets/service", () => ({
      getMorphoMarket: vi.fn(),
      getMorphoMarkets: vi.fn(),
    }));
    vi.doMock("@/server/services/watchlists", () => ({
      createWatchlist,
    }));

    const response = await postGraphql(
      `
        mutation CreateWatchlist($input: CreateWatchlistInput!) {
          createWatchlist(input: $input) {
            id
            name
            itemCount
          }
        }
      `,
      { input: { name: "New list", description: "" } },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.errors).toBeUndefined();
    expect(body.data.createWatchlist).toEqual({
      id: "00000000-0000-4000-8000-000000000101",
      name: "New list",
      itemCount: 0,
    });
    expect(createWatchlist).toHaveBeenCalledWith({
      userId: currentUser.id,
      name: "New list",
      description: "",
    });
  });

  it("updates, deletes, adds, and removes through watchlist mutations", async () => {
    const updateWatchlist = vi.fn(async () => ({
      id: "00000000-0000-4000-8000-000000000101",
      name: "Edited",
      description: "Updated",
      itemCount: 1,
      createdAt: "2026-05-11T08:00:00.000Z",
      updatedAt: "2026-05-11T09:00:00.000Z",
    }));
    const deleteWatchlist = vi.fn(async () => ({
      deletedId: "00000000-0000-4000-8000-000000000101",
    }));
    const addMarketToWatchlist = vi.fn(async () => ({
      id: "00000000-0000-4000-8000-000000000201",
      marketUniqueKey: "0xmarket",
      createdAt: "2026-05-11T08:00:00.000Z",
    }));
    const removeMarketFromWatchlist = vi.fn(async () => ({
      watchlistId: "00000000-0000-4000-8000-000000000101",
      marketUniqueKey: "0xmarket",
    }));
    vi.doMock("@/server/services/auth/current-user", () => ({
      getCurrentUser: vi.fn(async () => currentUser),
    }));
    vi.doMock("@/server/services/markets/service", () => ({
      getMorphoMarket: vi.fn(async () => market),
      getMorphoMarkets: vi.fn(),
    }));
    vi.doMock("@/server/services/watchlists", () => ({
      addMarketToWatchlist,
      deleteWatchlist,
      removeMarketFromWatchlist,
      updateWatchlist,
    }));

    const response = await postGraphql(
      `
        mutation AllWatchlistMutations(
          $update: UpdateWatchlistInput!
          $deleteId: ID!
          $add: AddMarketToWatchlistInput!
          $remove: RemoveMarketFromWatchlistInput!
        ) {
          updateWatchlist(input: $update) {
            name
          }
          deleteWatchlist(id: $deleteId) {
            deletedId
          }
          addMarketToWatchlist(input: $add) {
            marketUniqueKey
            market {
              marketId
            }
          }
          removeMarketFromWatchlist(input: $remove) {
            marketUniqueKey
          }
        }
      `,
      {
        update: {
          id: "00000000-0000-4000-8000-000000000101",
          name: "Edited",
          description: "Updated",
        },
        deleteId: "00000000-0000-4000-8000-000000000101",
        add: {
          watchlistId: "00000000-0000-4000-8000-000000000101",
          marketUniqueKey: "0xmarket",
        },
        remove: {
          watchlistId: "00000000-0000-4000-8000-000000000101",
          marketUniqueKey: "0xmarket",
        },
      },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.errors).toBeUndefined();
    expect(body.data.updateWatchlist.name).toBe("Edited");
    expect(body.data.deleteWatchlist.deletedId).toBe(
      "00000000-0000-4000-8000-000000000101",
    );
    expect(body.data.addMarketToWatchlist).toEqual({
      marketUniqueKey: "0xmarket",
      market: {
        marketId: "0xmarket",
      },
    });
    expect(body.data.removeMarketFromWatchlist.marketUniqueKey).toBe(
      "0xmarket",
    );
    expect(updateWatchlist).toHaveBeenCalledWith({
      userId: currentUser.id,
      watchlistId: "00000000-0000-4000-8000-000000000101",
      name: "Edited",
      description: "Updated",
    });
    expect(deleteWatchlist).toHaveBeenCalledWith({
      userId: currentUser.id,
      watchlistId: "00000000-0000-4000-8000-000000000101",
    });
    expect(addMarketToWatchlist).toHaveBeenCalledWith({
      userId: currentUser.id,
      watchlistId: "00000000-0000-4000-8000-000000000101",
      marketUniqueKey: "0xmarket",
    });
    expect(removeMarketFromWatchlist).toHaveBeenCalledWith({
      userId: currentUser.id,
      watchlistId: "00000000-0000-4000-8000-000000000101",
      marketUniqueKey: "0xmarket",
    });
  });
});

describe("GraphQL context", () => {
  afterEach(() => {
    vi.doUnmock("@/server/services/auth/current-user");
    vi.resetModules();
  });

  it("returns a null current user for anonymous requests", async () => {
    vi.doMock("@/server/services/auth/current-user", () => ({
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
    vi.doMock("@/server/services/auth/current-user", () => ({
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

const currentUser = {
  id: "00000000-0000-4000-8000-000000000001",
  walletAddress: "0x0000000000000000000000000000000000000001",
};
