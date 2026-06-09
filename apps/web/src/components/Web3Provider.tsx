"use client";

import { http, WagmiProvider, useAccount } from "wagmi";
import { hardhat, baseSepolia, mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { 
  getDefaultConfig, 
  RainbowKitProvider, 
  midnightTheme 
} from "@rainbow-me/rainbowkit";
import { 
  metaMaskWallet, 
  phantomWallet, 
  rainbowWallet, 
  coinbaseWallet 
} from "@rainbow-me/rainbowkit/wallets";
import { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ─── RainbowKit + Wagmi config ──────────────────────────────────────────────
const config = getDefaultConfig({
  appName: "Deposit",
  appDescription: "AI-Verified Crowd Escrow",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://deposit-web.vercel.app/",
  appIcon: "https://deposit-web.vercel.app/favicon.ico",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "deposit-local-dev",
  chains: [hardhat, baseSepolia, mainnet],
  transports: {
    [hardhat.id]: http("http://127.0.0.1:8545"),
    [baseSepolia.id]: http("https://sepolia.base.org"),
    [mainnet.id]: http("https://cloudflare-eth.com"), // Fixes eth.merkle.io CORS error during ENS resolution
  },
  wallets: [
    {
      groupName: 'Recommended',
      wallets: [phantomWallet, metaMaskWallet, rainbowWallet, coinbaseWallet],
    },
  ],
});

// ─── Global Routing Effects ─────────────────────────────────────────────────
function GlobalRoutingEffects() {
  const { status } = useAccount();
  const router = useRouter();

  useEffect(() => {
    // If the wallet explicitly disconnects, boot them back to the landing page
    if (status === "disconnected") {
      router.push("/");
    }
  }, [status, router]);

  return null;
}

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
        <RainbowKitProvider 
          theme={midnightTheme({
            accentColor: '#6366f1',
            accentColorForeground: 'white',
            borderRadius: 'large',
            fontStack: 'system',
            overlayBlur: 'small',
          })}
          initialChain={hardhat}
        >
          <GlobalRoutingEffects />
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
