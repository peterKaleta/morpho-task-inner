import { verifyMessage } from "viem";

import {
  and,
  authNonces,
  eq,
  getDb,
  isNull,
  users,
  type Database,
} from "@pk-task/db";

import { normalizeWalletAddress } from "./address";
import { AuthError } from "./errors";
import { createAuthNonce } from "./nonce";

export type AuthUser = {
  id: string;
  walletAddress: string;
};

export type VerifyWalletSignatureInput = {
  walletAddress: string;
  nonce: string;
  signature: string;
};

export { createAuthNonce };

export async function verifyWalletSignature(
  input: VerifyWalletSignatureInput,
  db: Database = getDb(),
  now = new Date(),
): Promise<AuthUser> {
  const walletAddress = normalizeWalletAddress(input.walletAddress);
  const [nonceRecord] = await db
    .select()
    .from(authNonces)
    .where(
      and(
        eq(authNonces.nonce, input.nonce),
        eq(authNonces.walletAddress, walletAddress),
      ),
    )
    .limit(1);

  if (!nonceRecord) {
    throw new AuthError("Unknown or invalid nonce.");
  }

  if (nonceRecord.usedAt) {
    throw new AuthError("Nonce has already been used.");
  }

  if (nonceRecord.expiresAt.getTime() <= now.getTime()) {
    throw new AuthError("Nonce has expired.");
  }

  const isValidSignature = await verifyMessage({
    address: walletAddress,
    message: nonceRecord.message,
    signature: input.signature as `0x${string}`,
  }).catch(() => false);

  if (!isValidSignature) {
    throw new AuthError("Invalid wallet signature.");
  }

  return db.transaction(async (tx) => {
    const [usedNonce] = await tx
      .update(authNonces)
      .set({
        usedAt: now,
        updatedAt: now,
      })
      .where(and(eq(authNonces.id, nonceRecord.id), isNull(authNonces.usedAt)))
      .returning({ id: authNonces.id });

    if (!usedNonce) {
      throw new AuthError("Nonce has already been used.");
    }

    const [user] = await tx
      .insert(users)
      .values({
        walletAddress,
        lastLoginAt: now,
        updatedAt: now,
        deletedAt: null,
      })
      .onConflictDoUpdate({
        target: users.walletAddress,
        set: {
          lastLoginAt: now,
          updatedAt: now,
          deletedAt: null,
        },
      })
      .returning({
        id: users.id,
        walletAddress: users.walletAddress,
      });

    if (!user) {
      throw new AuthError("Could not create or restore user.");
    }

    return user;
  });
}
