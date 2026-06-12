"use client";

/**
 * ConnectWalletModal
 *
 * A premium, reusable modal that prompts unconnected users to connect their wallet.
 * Uses RainbowKit's `openConnectModal()` — no manual deeplinks per guide Rule 2/3.
 *
 * Usage:
 *   const [showConnect, setShowConnect] = useState(false);
 *   <ConnectWalletModal isOpen={showConnect} onClose={() => setShowConnect(false)} />
 */

import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose?: () => void;
  /** Optional headline override */
  headline?: string;
  /** Optional body copy override */
  description?: string;
}

export default function ConnectWalletModal({
  isOpen,
  onClose,
  headline = "Connect Your Wallet",
  description = "You need a connected wallet to interact with this escrow campaign. Connect once — your session persists.",
}: ConnectWalletModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(14px)", background: "rgba(0,0,0,0.75)" }}
      // Click outside to dismiss (if onClose provided)
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={headline}
    >
      {/* Dialog card */}
      <div className="relative max-w-sm w-full bg-[#07070f] border border-white/10 rounded-3xl p-8 text-center shadow-[0_0_100px_rgba(99,102,241,0.12)] overflow-hidden">
        {/* Ambient glow top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-32 bg-indigo-500/15 blur-[60px] rounded-full pointer-events-none" />

        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        {/* Wallet icon */}
        <div className="relative w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6366f1"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Wallet body */}
            <rect x="2" y="5" width="20" height="14" rx="2" />
            {/* Wallet flap */}
            <path d="M16 12a2 2 0 1 1 4 0 2 2 0 0 1-4 0z" fill="rgba(99,102,241,0.2)" />
          </svg>
        </div>

        <h2 className="text-xl font-extrabold font-heading text-white mb-2 tracking-tight">
          {headline}
        </h2>
        <p className="text-slate-400 text-sm font-sans leading-relaxed mb-7 max-w-xs mx-auto">
          {description}
        </p>

        {/* RainbowKit button — WalletConnect owns the session, no manual deeplinks */}
        <div className="flex justify-center">
          <ConnectButton
            label="Connect Wallet"
            showBalance={false}
            chainStatus="none"
          />
        </div>

        <p className="text-[11px] text-slate-600 mt-5 font-sans leading-relaxed">
          Funds secured in a non-custodial smart contract on Base.
        </p>
      </div>
    </div>
  );
}
