"use client";

import { createConfig, http, WagmiProvider } from "wagmi";
import { hardhat, baseSepolia, mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { ReactNode, useState } from "react";

// ─── Wagmi config: supports local Hardhat node + Base Sepolia ──────────────
const config = createConfig(
  getDefaultConfig({
    chains: [hardhat, baseSepolia, mainnet],
    transports: {
      [hardhat.id]: http("http://127.0.0.1:8545"),
      [baseSepolia.id]: http("https://sepolia.base.org"),
      [mainnet.id]: http("https://cloudflare-eth.com"), // Fixes eth.merkle.io CORS error during ENS resolution
    },
    // ConnectKit app identity
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "deposit-local-dev",
    appName: "Deposit",
    appDescription: "AI-verified crowdfunding on Base — funds released only when your Oracle confirms milestone delivery.",
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://deposit-web.vercel.app",
    appIcon: "/favicon.ico",
  })
);

// ─── ConnectKit dark theme overrides to match Deposit design system ─────────
const connectKitTheme = {
  "--ck-body-background": "rgba(0, 0, 0, 0.96)",
  "--ck-body-background-secondary": "rgba(255, 255, 255, 0.04)",
  "--ck-body-background-tertiary": "rgba(255, 255, 255, 0.02)",
  "--ck-body-color": "#F8FAFC",
  "--ck-body-color-muted": "#9aa0a6",
  "--ck-body-color-danger": "#F87171",
  "--ck-primary-button-background": "#6366f1",
  "--ck-primary-button-color": "#ffffff",
  "--ck-primary-button-hover-background": "#4a5cff",
  "--ck-border-radius": "12px",
  "--ck-modal-box-shadow": "0 24px 80px rgba(0,0,0,0.9)",
  "--ck-overlay-background": "rgba(0, 0, 0, 0.85)",
  "--ck-body-divider": "rgba(255,255,255,0.06)",
  "--ck-focus-color": "#6366f1",
} as const;

export default function Web3Provider({ children }: { children: ReactNode }) {
  // Stable QueryClient instance — must not recreate on re-render
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10_000, // 10s — contract state is slow-moving
        retry: 2,
      },
    },
  }));

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          theme="midnight"
          customTheme={connectKitTheme}
          options={{
            enforceSupportedChains: false, // allow localhost in dev
            initialChainId: hardhat.id,
          }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
