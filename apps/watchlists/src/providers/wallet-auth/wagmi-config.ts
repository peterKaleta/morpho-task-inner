"use client";

import { getDefaultConfig } from "connectkit";
import { createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";

import { config as clientConfig } from "../../../config-client";

export function createWagmiConfig() {
  return createConfig(
    getDefaultConfig({
      appName: "Morpho Market Watchlists",
      ssr: true,
      chains: [mainnet],
      transports: {
        [mainnet.id]: http(),
      },
      walletConnectProjectId:
        clientConfig.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
    }),
  );
}
