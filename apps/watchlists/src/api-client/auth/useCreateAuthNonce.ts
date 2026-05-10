"use client";

import { useMutation } from "@tanstack/react-query";

import { requestJson } from "@/api-client/helpers";
import type { AuthNonceResponse } from "./types";

export function useCreateAuthNonce() {
  return useMutation({
    mutationFn: (walletAddress: `0x${string}`) =>
      requestJson<AuthNonceResponse>("/api/auth/nonce", {
        method: "POST",
        body: JSON.stringify({ walletAddress }),
      }),
  });
}
