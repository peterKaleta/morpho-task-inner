import { getAddress } from "viem";

import { AuthError } from "./errors";

export type WalletAddress = `0x${string}`;

export function normalizeWalletAddress(walletAddress: string): WalletAddress {
  try {
    return getAddress(walletAddress);
  } catch {
    throw new AuthError("Invalid wallet address.", 400);
  }
}
