import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const secret = "test-session-secret-with-at-least-32-characters";

describe("requestMorphoGraphql", () => {
  beforeEach(() => {
    vi.stubEnv("DATABASE_URL", "postgres://user:pass@localhost:5432/test");
    vi.stubEnv("MORPHO_API_URL", "https://api.morpho.org/graphql");
    vi.stubEnv("SESSION_SECRET", secret);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("sends GraphQL POST requests to the configured Morpho endpoint", async () => {
    const { requestMorphoGraphql } = await import("./client");
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        void input;
        void init;

        return Response.json({
          data: {
            ok: true,
          },
        });
      },
    );

    const data = await requestMorphoGraphql<
      { ok: boolean },
      { marketId: string }
    >(
      "query Test($marketId: String!) { market(id: $marketId) { id } }",
      {
        marketId: "0xmarket",
      },
      {
        fetchFn: fetchMock as typeof fetch,
      },
    );
    const [, init] = fetchMock.mock.calls[0] ?? [];

    expect(data).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.morpho.org/graphql",
      expect.objectContaining({
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
      }),
    );
    expect(JSON.parse(init?.body as string)).toEqual({
      query: "query Test($marketId: String!) { market(id: $marketId) { id } }",
      variables: {
        marketId: "0xmarket",
      },
    });
  });

  it("throws on non-2xx responses", async () => {
    const { requestMorphoGraphql } = await import("./client");
    const { MorphoApiError } = await import("./errors");
    const fetchMock = vi.fn(async () =>
      Response.json(
        {
          errors: [
            {
              message: "upstream unavailable",
            },
          ],
        },
        {
          status: 502,
        },
      ),
    );

    await expect(
      requestMorphoGraphql("query Test { ok }", undefined, {
        fetchFn: fetchMock as typeof fetch,
      }),
    ).rejects.toThrow(MorphoApiError);
  });

  it("throws on GraphQL errors", async () => {
    const { requestMorphoGraphql } = await import("./client");
    const { MorphoApiError } = await import("./errors");
    const fetchMock = vi.fn(async () =>
      Response.json({
        errors: [
          {
            message: "Cannot query field",
          },
        ],
      }),
    );

    await expect(
      requestMorphoGraphql("query Test { missingField }", undefined, {
        fetchFn: fetchMock as typeof fetch,
      }),
    ).rejects.toThrow(MorphoApiError);
  });
});
