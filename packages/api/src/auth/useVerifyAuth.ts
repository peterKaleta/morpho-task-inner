"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { getAuthApiUrl } from "../config";
import { requestJson } from "./client";
import type { VerifyAuthInput, VerifyAuthResponse } from "./types";
import { authMeQueryKey } from "./useAuthMe";

export function useVerifyAuth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: VerifyAuthInput) =>
      requestJson<VerifyAuthResponse>(getAuthApiUrl("verify"), {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(authMeQueryKey, { user: data.user });
      void queryClient.invalidateQueries({ queryKey: ["markets"] });
      void queryClient.invalidateQueries({ queryKey: ["market"] });
    },
  });
}
