import { randomBytes } from "node:crypto";

import { authNonces, getDb, type Database } from "@pk-task/db";

import { config } from "../../../config-server";
import { normalizeWalletAddress } from "./address";

const APP_NAME = "Morpho Market Watchlists";

export type CreatedNonce = {
  nonce: string;
  message: string;
  expiresAt: Date;
};

export async function createAuthNonce(
  walletAddress: string,
  db: Database = getDb(),
  now = new Date(),
): Promise<CreatedNonce> {
  const normalizedWalletAddress = normalizeWalletAddress(walletAddress);
  const nonce = randomBytes(24).toString("base64url");
  const expiresAt = new Date(
    now.getTime() + config.AUTH_NONCE_TTL_SECONDS * 1000,
  );
  const message = buildSignInMessage({
    walletAddress: normalizedWalletAddress,
    nonce,
    expiresAt,
  });

  await db.insert(authNonces).values({
    walletAddress: normalizedWalletAddress,
    nonce,
    message,
    expiresAt,
  });

  return {
    nonce,
    message,
    expiresAt,
  };
}

export function buildSignInMessage({
  walletAddress,
  nonce,
  expiresAt,
}: {
  walletAddress: string;
  nonce: string;
  expiresAt: Date;
}): string {
  return [
    `Sign in to ${APP_NAME}.`,
    "",
    `Wallet: ${walletAddress}`,
    `Nonce: ${nonce}`,
    `Expires: ${expiresAt.toISOString()}`,
    "",
    "This signature will not trigger a blockchain transaction or cost gas.",
  ].join("\n");
}
