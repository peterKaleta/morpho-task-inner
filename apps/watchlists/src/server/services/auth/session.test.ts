import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SessionPayload } from "./session";

const secret = "test-session-secret-with-at-least-32-characters";

describe("session cookies", () => {
  beforeEach(() => {
    vi.stubEnv("DATABASE_URL", "postgres://user:pass@localhost:5432/test");
    vi.stubEnv("MORPHO_API_URL", "https://api.morpho.org/graphql");
    vi.stubEnv("SESSION_SECRET", secret);
    vi.stubEnv("AUTH_NONCE_TTL_SECONDS", "600");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("verifies signed session payloads", async () => {
    const { signSessionPayload, verifySessionCookieValue } = await import(
      "./session"
    );
    const payload: SessionPayload = {
      userId: "00000000-0000-4000-8000-000000000001",
      walletAddress: "0x0000000000000000000000000000000000000001",
      expiresAt: "2030-01-01T00:00:00.000Z",
    };

    const cookieValue = signSessionPayload(payload, secret);

    expect(verifySessionCookieValue(cookieValue, secret)).toEqual(payload);
  });

  it("rejects tampered payloads", async () => {
    const { signSessionPayload, verifySessionCookieValue } = await import(
      "./session"
    );
    const payload: SessionPayload = {
      userId: "00000000-0000-4000-8000-000000000001",
      walletAddress: "0x0000000000000000000000000000000000000001",
      expiresAt: "2030-01-01T00:00:00.000Z",
    };

    const cookieValue = `${signSessionPayload(payload, secret)}tampered`;

    expect(verifySessionCookieValue(cookieValue, secret)).toBeNull();
  });

  it("rejects expired payloads", async () => {
    const { signSessionPayload, verifySessionCookieValue } = await import(
      "./session"
    );
    const payload: SessionPayload = {
      userId: "00000000-0000-4000-8000-000000000001",
      walletAddress: "0x0000000000000000000000000000000000000001",
      expiresAt: "2020-01-01T00:00:00.000Z",
    };

    expect(
      verifySessionCookieValue(signSessionPayload(payload, secret), secret),
    ).toBeNull();
  });
});
