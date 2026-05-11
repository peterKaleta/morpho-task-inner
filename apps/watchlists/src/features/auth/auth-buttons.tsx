"use client";

import { ConnectKitButton } from "connectkit";
import { LogOut, PenLine, Wallet } from "lucide-react";
import { useCallback } from "react";
import { useAccount, useDisconnect, useSignMessage } from "wagmi";

import { Button } from "@pk-task/ui/components/button";

import { formatWalletAddress } from "@/helpers/format-wallet-address";
import { useSession } from "@/providers/session-provider";

export function AuthButtons() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const session = useSession();

  const activeAddress = session.user?.walletAddress ?? address;
  const isSessionForConnectedWallet =
    Boolean(session.user && address) &&
    session.user?.walletAddress.toLowerCase() === address?.toLowerCase();
  const needsWalletSignature =
    session.status === "signed-out" ||
    (session.status === "signed-in" && !isSessionForConnectedWallet);

  const handleSignIn = useCallback(
    async () => {
      if (!address) {
        return;
      }

      await session.signInWithWallet(address, signMessageAsync);
    },
    [address, session, signMessageAsync],
  );

  const handleLogout = useCallback(async () => {
    await session.logout();
    disconnect();
  }, [disconnect, session]);

  const handleRetrySignature = useCallback(() => {
    void handleSignIn();
  }, [handleSignIn]);

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

        if (session.isSigningIn) {
          return (
            <Button variant="outline" size="sm" disabled>
              <PenLine className="size-4" aria-hidden="true" />
              Signing
            </Button>
          );
        }

        if (needsWalletSignature && !session.error) {
          return (
            <Button variant="outline" size="sm" onClick={handleRetrySignature}>
              <PenLine className="size-4" aria-hidden="true" />
              Sign message
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
