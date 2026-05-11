import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const SESSION_COOKIE_NAME = "morpho_watchlists_session";
const validWalletAddress = "0x0000000000000000000000000000000000000001";

describe("auth REST routes", () => {
  beforeEach(() => {
    vi.stubEnv("DATABASE_URL", "postgres://user:pass@localhost:5432/test");
    vi.stubEnv("MORPHO_API_URL", "https://api.morpho.org/graphql");
    vi.stubEnv(
      "SESSION_SECRET",
      "test-session-secret-with-at-least-32-characters",
    );
    vi.stubEnv("AUTH_NONCE_TTL_SECONDS", "600");
  });

  afterEach(() => {
    vi.doUnmock("@/server/services/auth/service");
    vi.doUnmock("@/server/services/auth/current-user");
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("creates a nonce", async () => {
    vi.doMock("@/server/services/auth/service", () => ({
      createAuthNonce: vi.fn(async () => ({
        nonce: "nonce-value",
        message: "message-to-sign",
        expiresAt: new Date("2030-01-01T00:00:00.000Z"),
      })),
    }));

    const { POST } = await import("./nonce/route");
    const response = await POST(
      jsonRequest({ walletAddress: validWalletAddress }),
    );

    await expect(response.json()).resolves.toEqual({
      nonce: "nonce-value",
      message: "message-to-sign",
      expiresAt: "2030-01-01T00:00:00.000Z",
    });
    expect(response.status).toBe(200);
  });

  it("rejects malformed nonce requests", async () => {
    vi.doMock("@/server/services/auth/service", () => ({
      createAuthNonce: vi.fn(),
    }));

    const { POST } = await import("./nonce/route");
    const response = await POST(jsonRequest({ walletAddress: "" }));

    expect(response.status).toBe(400);
  });

  it("sets a session cookie after wallet verification", async () => {
    vi.doMock("@/server/services/auth/service", () => ({
      verifyWalletSignature: vi.fn(async () => ({
        id: "00000000-0000-4000-8000-000000000001",
        walletAddress: validWalletAddress,
      })),
    }));

    const { POST } = await import("./verify/route");
    const response = await POST(
      jsonRequest({
        walletAddress: validWalletAddress,
        nonce: "nonce-value",
        signature: "0xsignature",
      }),
    );

    await expect(response.json()).resolves.toEqual({
      user: {
        id: "00000000-0000-4000-8000-000000000001",
        walletAddress: validWalletAddress,
      },
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain(SESSION_COOKIE_NAME);
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(response.headers.get("set-cookie")).toContain("SameSite=lax");
  });

  it("returns 401 for rejected wallet verification", async () => {
    const { AuthError } = await import("@/server/services/auth/errors");

    vi.doMock("@/server/services/auth/service", () => ({
      verifyWalletSignature: vi.fn(async () => {
        throw new AuthError("Invalid wallet signature.");
      }),
    }));

    const { POST } = await import("./verify/route");
    const response = await POST(
      jsonRequest({
        walletAddress: validWalletAddress,
        nonce: "nonce-value",
        signature: "0xsignature",
      }),
    );

    expect(response.status).toBe(401);
  });

  it("clears the session cookie on logout", async () => {
    const { POST } = await import("./logout/route");
    const response = await POST();

    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(response.headers.get("set-cookie")).toContain(SESSION_COOKIE_NAME);
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });

  it("returns the current user", async () => {
    vi.doMock("@/server/services/auth/current-user", () => ({
      getCurrentUser: vi.fn(async () => ({
        id: "00000000-0000-4000-8000-000000000001",
        walletAddress: validWalletAddress,
      })),
    }));

    const { GET } = await import("./me/route");
    const response = await GET(new Request("http://localhost/api/auth/me"));

    await expect(response.json()).resolves.toEqual({
      user: {
        id: "00000000-0000-4000-8000-000000000001",
        walletAddress: validWalletAddress,
      },
    });
    expect(response.status).toBe(200);
  });
});

function jsonRequest(body: unknown): Request {
  return new Request("http://localhost/api/auth/test", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
