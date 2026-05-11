"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { requestJson } from "./client";
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
      void queryClient.invalidateQueries({ queryKey: ["markets"] });
      void queryClient.invalidateQueries({ queryKey: ["market"] });
    },
  });
}
