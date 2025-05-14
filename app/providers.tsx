"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, base } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import type { FC, ReactNode } from "react";
import { clientEnv as env } from "../lib/env";

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [mainnet, base],
    transports: {
      [base.id]: http(
        `https://base-mainnet.g.alchemy.com/v2/${env.NEXT_PUBLIC_ALCHEMY_ID}`
      ),
    },

    // Required API Keys
    walletConnectProjectId: env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,

    // Required App Info
    appName: "Token Sweeper",

    // Optional App Info
    appDescription:
      "Convert all your small token balances to ETH in a single transaction.",
    appUrl: "https://family.co", // your app's url
    appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  })
);

const queryClient = new QueryClient();

export const Web3Provider: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
