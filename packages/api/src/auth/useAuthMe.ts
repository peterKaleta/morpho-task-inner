"use client";

import { useQuery } from "@tanstack/react-query";

import { requestJson } from "./client";
import type { AuthMeResponse } from "./types";

export const authMeQueryKey = ["auth", "me"] as const;

export function useAuthMe() {
  return useQuery({
    queryKey: authMeQueryKey,
    queryFn: () =>
      requestJson<AuthMeResponse>("/api/auth/me", {
        cache: "no-store",
      }),
  });
}
