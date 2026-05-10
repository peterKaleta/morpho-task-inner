"use client";

import { ConnectKitProvider } from "connectkit";
import { useEffect, useState } from "react";
import { WagmiProvider, type Config } from "wagmi";

import { createWagmiConfig } from "@/components/wagmi-config";

export function WalletAuthProviders({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
}) {
  const [wagmiConfig, setWagmiConfig] = useState<Config | null>(null);

  useEffect(() => {
    setWagmiConfig(createWagmiConfig());
  }, []);

  if (!wagmiConfig) {
    return fallback;
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <ConnectKitProvider mode="dark">{children}</ConnectKitProvider>
    </WagmiProvider>
  );
}
