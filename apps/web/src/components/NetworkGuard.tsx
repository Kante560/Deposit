"use client";

import React, { useEffect, useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { baseSepolia, hardhat } from "wagmi/chains";

export default function NetworkGuard({ children }: { children: React.ReactNode }) {
  const { isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Allow localhost/hardhat for development, otherwise restrict to Base Sepolia
  const allowedChains: number[] = [hardhat.id, baseSepolia.id];
  const isWrongNetwork = isConnected && chainId && !allowedChains.includes(chainId);

  if (!mounted) return <>{children}</>;

  if (isWrongNetwork) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-obsidian text-white p-6">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-6 text-red-500">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <h2 className="text-2xl font-bold font-heading mb-3">Wrong Network Detected</h2>
          <p className="text-gray-400 mb-8 font-sans">
            Deposit Escrow currently operates exclusively on Base Sepolia. Please switch your wallet network to continue.
          </p>
          <button
            onClick={() => switchChain({ chainId: baseSepolia.id })}
            className="w-full py-4 bg-[#6366f1] hover:bg-[#4a5cff] text-white font-semibold rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]"
          >
            Switch to Base Sepolia
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
