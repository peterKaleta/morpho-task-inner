"use client";

import { ConnectKitProvider } from "connectkit";
import { useEffect, useState } from "react";
import { WagmiProvider, type Config } from "wagmi";

import { createWagmiConfig } from "./wagmi-config";

export function WalletAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [wagmiConfig, setWagmiConfig] = useState<Config | null>(null);

  useEffect(() => {
    setWagmiConfig(createWagmiConfig());
  }, []);

  if (!wagmiConfig) {
    return null;
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <ConnectKitProvider mode="dark">{children}</ConnectKitProvider>
    </WagmiProvider>
  );
}
