"use client";

import { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { config } from "@/lib/wagmi";
import { hardhat } from "wagmi/chains";

import { WagmiProvider, useAccount } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, midnightTheme } from "@rainbow-me/rainbowkit";

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
