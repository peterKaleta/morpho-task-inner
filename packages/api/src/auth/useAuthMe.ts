"use client";

import { useQuery } from "@tanstack/react-query";

import { getAuthApiUrl } from "../config";
import { requestJson } from "./client";
import type { AuthMeResponse } from "./types";

export const authMeQueryKey = ["auth", "me"] as const;

export function useAuthMe() {
  return useQuery({
    queryKey: authMeQueryKey,
    queryFn: () =>
      requestJson<AuthMeResponse>(getAuthApiUrl("me"), {
        cache: "no-store",
      }),
  });
}
