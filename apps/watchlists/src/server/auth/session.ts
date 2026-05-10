import { createHmac, timingSafeEqual } from "node:crypto";

import { z } from "@pk-task/shared/text-helpers";

import { config } from "../../../config-server";

export const SESSION_COOKIE_NAME = "morpho_watchlists_session";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

const sessionPayloadSchema = z.object({
  userId: z.string().uuid(),
  walletAddress: z.string().min(1),
  expiresAt: z.string().datetime(),
});

export type SessionPayload = z.infer<typeof sessionPayloadSchema>;

export type SessionCookieOptions = {
  httpOnly: true;
  sameSite: "lax";
  secure: boolean;
  path: "/";
  maxAge: number;
  expires: Date;
};

export function createSessionPayload(user: {
  id: string;
  walletAddress: string;
}): SessionPayload {
  return {
    userId: user.id,
    walletAddress: user.walletAddress,
    expiresAt: new Date(
      Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
    ).toISOString(),
  };
}

export function signSessionPayload(
  payload: SessionPayload,
  secret = config.SESSION_SECRET,
): string {
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload, secret);

  return `${encodedPayload}.${signature}`;
}

export function verifySessionCookieValue(
  cookieValue: string | undefined,
  secret = config.SESSION_SECRET,
  now = new Date(),
): SessionPayload | null {
  if (!cookieValue) {
    return null;
  }

  const [encodedPayload, signature, extra] = cookieValue.split(".");

  if (!encodedPayload || !signature || extra !== undefined) {
    return null;
  }

  if (!secureCompare(signature, sign(encodedPayload, secret))) {
    return null;
  }

  try {
    const parsed = sessionPayloadSchema.parse(
      JSON.parse(decodeBase64Url(encodedPayload)),
    );

    if (new Date(parsed.expiresAt).getTime() <= now.getTime()) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function getSessionCookieOptions(
  payload: SessionPayload,
): SessionCookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: config.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
    expires: new Date(payload.expiresAt),
  };
}

export function getClearSessionCookieOptions(): Pick<
  SessionCookieOptions,
  "httpOnly" | "sameSite" | "secure" | "path" | "maxAge"
> {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: config.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
}

export function readCookie(
  cookieHeader: string | null,
  name: string,
): string | undefined {
  if (!cookieHeader) {
    return undefined;
  }

  for (const cookie of cookieHeader.split(";")) {
    const [rawName, ...rawValue] = cookie.trim().split("=");

    if (rawName === name) {
      return rawValue.join("=");
    }
  }

  return undefined;
}

function sign(encodedPayload: string, secret: string): string {
  return createHmac("sha256", secret).update(encodedPayload).digest("base64url");
}

function secureCompare(value: string, expectedValue: string): boolean {
  const valueBuffer = Buffer.from(value);
  const expectedValueBuffer = Buffer.from(expectedValue);

  if (valueBuffer.length !== expectedValueBuffer.length) {
    return false;
  }

  return timingSafeEqual(valueBuffer, expectedValueBuffer);
}

function encodeBase64Url(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}
