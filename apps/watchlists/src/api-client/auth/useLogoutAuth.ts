"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { requestJson } from "@/api-client/helpers";
import type { AuthMeResponse } from "./types";
import { authMeQueryKey } from "./useAuthMe";

export function useLogoutAuth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      requestJson<{ ok: true }>("/api/auth/logout", {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.setQueryData<AuthMeResponse>(authMeQueryKey, { user: null });
    },
  });
}
