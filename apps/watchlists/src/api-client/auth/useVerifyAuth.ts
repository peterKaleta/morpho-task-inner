"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { requestJson } from "@/api-client/helpers";
import { authMeQueryKey } from "./useAuthMe";
import type { VerifyAuthInput, VerifyAuthResponse } from "./types";

export function useVerifyAuth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: VerifyAuthInput) =>
      requestJson<VerifyAuthResponse>("/api/auth/verify", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(authMeQueryKey, { user: data.user });
    },
  });
}
