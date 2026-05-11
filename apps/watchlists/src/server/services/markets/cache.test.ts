import { describe, expect, it } from "vitest";

import { morphoMarketCacheKey, morphoMarketsCacheKey } from "./cache";

describe("Morpho market cache keys", () => {
  it("normalizes equivalent market list search text", () => {
    expect(
      morphoMarketsCacheKey({
        first: 20,
        search: "  usdc  ",
        skip: 0,
      }),
    ).toBe(
      morphoMarketsCacheKey({
        first: 20,
        search: "usdc",
        skip: 0,
      }),
    );
  });

  it("includes market list pagination and search inputs", () => {
    expect(
      new Set([
        morphoMarketsCacheKey({
          first: 20,
          search: "usdc",
          skip: 0,
        }),
        morphoMarketsCacheKey({
          first: 50,
          search: "usdc",
          skip: 0,
        }),
        morphoMarketsCacheKey({
          first: 20,
          search: "usdc",
          skip: 20,
        }),
        morphoMarketsCacheKey({
          first: 20,
          search: "weth",
          skip: 0,
        }),
      ]).size,
    ).toBe(4);
  });

  it("trims market detail ids", () => {
    expect(morphoMarketCacheKey("  0xmarket  ")).toBe(
      morphoMarketCacheKey("0xmarket"),
    );
  });
});
