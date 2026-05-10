"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { useAuthMe } from "@/api-client/auth/useAuthMe";
import { useCreateAuthNonce } from "@/api-client/auth/useCreateAuthNonce";
import { useLogoutAuth } from "@/api-client/auth/useLogoutAuth";
import { useVerifyAuth } from "@/api-client/auth/useVerifyAuth";
import type { AuthUser } from "@/api-client/auth/types";
import { isTransientWalletSigningError } from "@/helpers/wallet-signing-errors";

export type SessionUser = {
  id: string;
  walletAddress: string;
};

type SessionState =
  | { status: "loading"; user: null }
  | { status: "signed-out"; user: null }
  | { status: "signed-in"; user: SessionUser };

type SignMessage = (args: { message: string }) => Promise<`0x${string}`>;

type SessionContextValue = SessionState & {
  error: string | null;
  isSigningIn: boolean;
  refresh: () => Promise<void>;
  signInWithWallet: (
    walletAddress: `0x${string}`,
    signMessage: SignMessage,
  ) => Promise<void>;
  logout: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined,
);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const authMe = useAuthMe();
  const createAuthNonce = useCreateAuthNonce();
  const verifyAuth = useVerifyAuth();
  const logoutAuth = useLogoutAuth();
  const [error, setError] = useState<string | null>(null);
  const { data: authMeData, isLoading: isAuthMeLoading, refetch } = authMe;
  const {
    isPending: isCreatingAuthNonce,
    mutateAsync: createAuthNonceAsync,
  } = createAuthNonce;
  const { isPending: isVerifyingAuth, mutateAsync: verifyAuthAsync } =
    verifyAuth;
  const { mutateAsync: logoutAuthAsync } = logoutAuth;

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const signInWithWallet = useCallback(
    async (walletAddress: `0x${string}`, signMessage: SignMessage) => {
      setError(null);

      try {
        const nonceBody = await createAuthNonceAsync(walletAddress);
        const signature = await signMessage({ message: nonceBody.message });

        await verifyAuthAsync({
          walletAddress,
          nonce: nonceBody.nonce,
          signature,
        });
      } catch (caughtError) {
        const message =
          caughtError instanceof Error
            ? caughtError.message
            : "Could not sign in with wallet.";

        setError(isTransientWalletSigningError(caughtError) ? null : message);
        throw caughtError;
      }
    },
    [createAuthNonceAsync, verifyAuthAsync],
  );

  const logout = useCallback(async () => {
    setError(null);
    await logoutAuthAsync();
  }, [logoutAuthAsync]);

  const session = getSessionState(authMeData?.user ?? null, isAuthMeLoading);
  const isSigningIn = isCreatingAuthNonce || isVerifyingAuth;

  const value = useMemo<SessionContextValue>(
    () => ({
      ...session,
      error,
      isSigningIn,
      refresh,
      signInWithWallet,
      logout,
    }),
    [error, isSigningIn, logout, refresh, session, signInWithWallet],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

function getSessionState(
  user: AuthUser | null,
  isLoading: boolean,
): SessionState {
  if (isLoading) {
    return { status: "loading", user: null };
  }

  return user
    ? { status: "signed-in", user }
    : { status: "signed-out", user: null };
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within SessionProvider.");
  }

  return context;
}
