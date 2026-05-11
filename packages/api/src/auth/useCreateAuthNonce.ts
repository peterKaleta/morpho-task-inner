"use client";

import { useMutation } from "@tanstack/react-query";

import { getAuthApiUrl } from "../config";
import { requestJson } from "./client";
import type { AuthNonceResponse } from "./types";

export function useCreateAuthNonce() {
  return useMutation({
    mutationFn: (walletAddress: `0x${string}`) =>
      requestJson<AuthNonceResponse>(getAuthApiUrl("nonce"), {
        method: "POST",
        body: JSON.stringify({ walletAddress }),
      }),
  });
}
