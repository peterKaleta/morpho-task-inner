import { afterEach, describe, expect, it, vi } from "vitest";

import {
  POSTGRES_UNIQUE_VIOLATION_CODE,
  WATCHLIST_NAME_UNIQUE_CONSTRAINT,
} from "./constants";

describe("watchlist service errors", () => {
  afterEach(() => {
    vi.doUnmock("./repository");
    vi.resetModules();
  });

  it("maps watchlist name unique violations to a stable domain error", async () => {
    const repositoryError = Object.assign(new Error("duplicate key"), {
      code: POSTGRES_UNIQUE_VIOLATION_CODE,
      constraint_name: WATCHLIST_NAME_UNIQUE_CONSTRAINT,
    });
    const createUserWatchlist = mockRepositoryCreateError(repositoryError);
    const { createWatchlist } = await import("./service");

    await expect(
      createWatchlist(
        {
          userId: "00000000-0000-4000-8000-000000000001",
          name: "Blue chips",
          description: null,
        },
        {} as never,
      ),
    ).rejects.toMatchObject({
      code: "WATCHLIST_NAME_TAKEN",
      message: "A watchlist with this name already exists.",
      status: 409,
    });
    expect(createUserWatchlist).toHaveBeenCalledWith(
      {
        userId: "00000000-0000-4000-8000-000000000001",
        name: "Blue chips",
        description: null,
      },
      {},
    );
  });

  it("maps wrapped watchlist name unique violations", async () => {
    const repositoryError = Object.assign(new Error("repository failed"), {
      cause: {
        code: POSTGRES_UNIQUE_VIOLATION_CODE,
        constraint: WATCHLIST_NAME_UNIQUE_CONSTRAINT,
      },
    });
    mockRepositoryCreateError(repositoryError);
    const { createWatchlist } = await import("./service");

    await expect(
      createWatchlist(
        {
          userId: "00000000-0000-4000-8000-000000000001",
          name: "Blue chips",
          description: null,
        },
        {} as never,
      ),
    ).rejects.toMatchObject({
      code: "WATCHLIST_NAME_TAKEN",
      status: 409,
    });
  });

  it("does not map unrelated unique violations to name-taken errors", async () => {
    const repositoryError = Object.assign(new Error("duplicate key"), {
      code: POSTGRES_UNIQUE_VIOLATION_CODE,
      constraint_name: "watchlist_items_active_watchlist_id_market_unique_key_unique",
    });
    mockRepositoryCreateError(repositoryError);
    const { createWatchlist } = await import("./service");

    await expect(
      createWatchlist(
        {
          userId: "00000000-0000-4000-8000-000000000001",
          name: "Blue chips",
          description: null,
        },
        {} as never,
      ),
    ).rejects.toBe(repositoryError);
  });
});

function mockRepositoryCreateError(error: unknown) {
  const createUserWatchlist = vi.fn(async () => {
    throw error;
  });

  vi.doMock("./repository", () => ({
    countUserWatchlistsContainingMarket: vi.fn(),
    createUserWatchlist,
    createWatchlistItem: vi.fn(),
    deleteUserWatchlist: vi.fn(),
    findActiveWatchlist: vi.fn(),
    findActiveWatchlistItem: vi.fn(),
    getUserWatchlist: vi.fn(),
    listUserWatchlists: vi.fn(),
    removeWatchlistItem: vi.fn(),
    updateUserWatchlist: vi.fn(),
  }));

  return createUserWatchlist;
}
