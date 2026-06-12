"use client";

/**
 * WalletGuard — route-level protection for /create (and any future protected pages).
 *
 * Behaviour:
 *  - SSR / not mounted   → render null (hydration safety)
 *  - Not connected       → blurred page background + ConnectWalletModal overlay
 *  - Connected, wrong network → switch-network prompt overlay
 *  - Connected, correct network → render children normally
 *
 * When the user disconnects while on /create, wagmi's useAccount() will flip
 * isConnected → false, which causes WalletGuard to re-render and show the
 * connect overlay again automatically (no explicit effect needed).
 *
 * Per guidewalletconnect.md: WalletGuard does NOT use manual deeplinks.
 * The ConnectWalletModal uses RainbowKit's ConnectButton which creates a
 * proper WalletConnect session.
 */

import React, { useEffect, useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { baseSepolia, hardhat } from "wagmi/chains";
import ConnectWalletModal from "@/components/ConnectWalletModal";

const ALLOWED_CHAINS: number[] = [hardhat.id, baseSepolia.id];

export default function WalletGuard({ children }: { children: React.ReactNode }) {
  const { isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const [mounted, setMounted] = useState(false);

  // Hydration safety: never render wallet state on the server
  useEffect(() => {
    setMounted(true);
  }, []);

  // Not mounted yet — render nothing to avoid hydration mismatch
  if (!mounted) return null;

  const isWrongNetwork = isConnected && chainId && !ALLOWED_CHAINS.includes(chainId);

  // ── Case 1: Not connected ─────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <>
        {/* ConnectWalletModal — uses RainbowKit, no manual deeplinks */}
        <ConnectWalletModal
          isOpen={true}
          headline="Connect to Launch"
          description="You need a connected wallet to create an escrow campaign on Base. This ensures the campaign is linked to your on-chain identity."
        />

        {/* Blurred page content behind the modal for visual context */}
        <div
          className="pointer-events-none select-none"
          style={{ filter: "blur(5px)", opacity: 0.25 }}
          aria-hidden="true"
        >
          {children}
        </div>
      </>
    );
  }

  // ── Case 2: Connected but wrong network ───────────────────────────────────
  if (isWrongNetwork) {
    return (
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style={{ backdropFilter: "blur(14px)", background: "rgba(0,0,0,0.78)" }}
        role="dialog"
        aria-modal="true"
        aria-label="Wrong network"
      >
        <div className="relative max-w-sm w-full bg-[#07070f] border border-white/10 rounded-3xl p-8 text-center shadow-2xl overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-32 bg-red-500/10 blur-[60px] rounded-full pointer-events-none" />

          {/* Warning icon */}
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f87171"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <h2 className="text-2xl font-extrabold font-heading text-white mb-2 tracking-tight">
            Wrong Network
          </h2>
          <p className="text-slate-400 text-sm font-sans leading-relaxed mb-8 max-w-xs mx-auto">
            Deposit Escrow operates on{" "}
            <span className="text-white font-semibold">Base Sepolia</span>. Switch
            your wallet network to continue.
          </p>

          <button
            id="switch-network-btn"
            onClick={() => switchChain({ chainId: baseSepolia.id })}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-[0_0_24px_rgba(99,102,241,0.3)] hover:shadow-[0_0_32px_rgba(99,102,241,0.5)] text-sm cursor-pointer"
          >
            Switch to Base Sepolia
          </button>
        </div>
      </div>
    );
  }

  // ── Case 3: Connected + correct network → render children ─────────────────
  return <>{children}</>;
}
