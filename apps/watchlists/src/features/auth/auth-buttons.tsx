"use client";

import { ConnectKitButton } from "connectkit";
import { LogOut, PenLine, Wallet } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { useAccount, useDisconnect, useSignMessage } from "wagmi";

import { Button } from "@pk-task/ui/components/button";

import { formatWalletAddress } from "@/helpers/format-wallet-address";
import { isTransientWalletSigningError } from "@/helpers/wallet-signing-errors";
import { useSession } from "@/providers/session-provider";

const AUTO_SIGN_DELAY_MS = 400;

export function AuthButtons() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const session = useSession();
  const promptedAddressRef = useRef<string | null>(null);

  const activeAddress = session.user?.walletAddress ?? address;
  const isSessionForConnectedWallet =
    Boolean(session.user && address) &&
    session.user?.walletAddress.toLowerCase() === address?.toLowerCase();
  const shouldAuthenticateConnectedWallet =
    session.status === "signed-out" ||
    (session.status === "signed-in" && !isSessionForConnectedWallet);

  const handleSignIn = useCallback(
    async ({ retry = false } = {}) => {
      if (!address) {
        return;
      }

      if (retry) {
        promptedAddressRef.current = null;
      }

      promptedAddressRef.current = address;
      try {
        await session.signInWithWallet(address, signMessageAsync);
      } catch (error) {
        if (isTransientWalletSigningError(error)) {
          promptedAddressRef.current = null;
        }

        throw error;
      }
    },
    [address, session, signMessageAsync],
  );

  const handleLogout = useCallback(async () => {
    await session.logout();
    disconnect();
    promptedAddressRef.current = null;
  }, [disconnect, session]);

  const handleRetrySignature = useCallback(() => {
    void handleSignIn({ retry: true });
  }, [handleSignIn]);

  useEffect(() => {
    if (
      !isConnected ||
      !address ||
      !shouldAuthenticateConnectedWallet ||
      session.isSigningIn ||
      promptedAddressRef.current === address
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void handleSignIn().catch(() => {
        // SessionProvider owns the user-facing auth error state.
      });
    }, AUTO_SIGN_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [
    address,
    handleSignIn,
    isConnected,
    session.isSigningIn,
    shouldAuthenticateConnectedWallet,
  ]);

  return (
    <ConnectKitButton.Custom>
      {({ show }) => {
        if (!isConnected || !address) {
          return (
            <Button variant="outline" size="sm" onClick={show}>
              <Wallet className="size-4" aria-hidden="true" />
              Connect
            </Button>
          );
        }

        if (session.status === "signed-in" && isSessionForConnectedWallet) {
          return (
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={show}>
                <Wallet className="size-4" aria-hidden="true" />
                {formatWalletAddress(activeAddress)}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                aria-label="Log out"
              >
                <LogOut className="size-4" aria-hidden="true" />
              </Button>
            </div>
          );
        }

        if (session.isSigningIn || !session.error) {
          return (
            <Button variant="outline" size="sm" disabled>
              <PenLine className="size-4" aria-hidden="true" />
              Signing
            </Button>
          );
        }

        return (
          <Button variant="outline" size="sm" onClick={handleRetrySignature}>
            <PenLine className="size-4" aria-hidden="true" />
            Retry signature
          </Button>
        );
      }}
    </ConnectKitButton.Custom>
  );
}
