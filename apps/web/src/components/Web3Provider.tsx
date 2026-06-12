"use client";

import { ReactNode, useState } from "react";
import { config } from "@/lib/wagmi";
import { hardhat } from "wagmi/chains";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, midnightTheme } from "@rainbow-me/rainbowkit";

/**
 * Web3Provider
 *
 * Sets up the wagmi + RainbowKit context for the entire app.
 *
 * Design decisions:
 * - No global redirect-on-disconnect here. Public pages (/, /explore, /campaign/[id])
 *   should remain accessible without a wallet. Only protected routes (/create)
 *   use WalletGuard to gate access.
 * - The old `GlobalRoutingEffects` component that force-redirected all users to `/`
 *   on disconnect has been removed — it broke UX on public pages.
 */
export default function Web3Provider({ children }: { children: ReactNode }) {
  // Stable QueryClient — must not recreate on re-render
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 10s stale time — contract state is slow-moving
            staleTime: 10_000,
            retry: 2,
          },
        },
      })
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={midnightTheme({
            accentColor: "#6366f1",
            accentColorForeground: "white",
            borderRadius: "large",
            fontStack: "system",
            overlayBlur: "small",
          })}
          initialChain={hardhat}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
