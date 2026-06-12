"use client";

/**
 * Navbar
 *
 * Wallet connect changes (per guidewalletconnect.md):
 * - Rule 2/3: All window.location.href deeplinks removed. Mobile wallet buttons
 *   now call `connect(connector)` via wagmi, which creates a proper WalletConnect
 *   session and lets the wallet app open itself.
 * - Rule 4/5: If the user is already inside MetaMask or Phantom's in-app browser
 *   (detected via window.ethereum.isMetaMask / window.phantom), we skip connector
 *   selection and call openConnectModal() directly.
 * - Rule 7: Desktop uses <ConnectButton.Custom />, mobile uses connect(connector).
 *
 * Post-connect modal:
 * - Fires only once per browser session (sessionStorage flag).
 * - Never re-fires on page refresh.
 * - Suppressed if the user is already on /create.
 */

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useAccountEffect, useConnect } from "wagmi";
import { useRouter, usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

gsap.registerPlugin(useGSAP);

// ─── Connector ID constants ─────────────────────────────────────────────────
// These match the IDs wagmi assigns to RainbowKit's wallet connectors.
const METAMASK_CONNECTOR_ID = "metaMask";
const PHANTOM_CONNECTOR_ID = "com.phantom";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Post-connect "Launch Campaign?" prompt
  const [showLaunchPrompt, setShowLaunchPrompt] = useState(false);

  const navbarRef = useRef<HTMLDivElement>(null);

  const { isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const router = useRouter();
  const pathname = usePathname();

  // ── Entrance Animation ─────────────────────────────────────────────────────
  useGSAP(() => {
    gsap.from(navbarRef.current, {
      y: -30,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    });
  }, { scope: navbarRef });

  // ── Post-connect prompt ────────────────────────────────────────────────────
  // Only fires on a FRESH connection event, never on page refresh.
  // Uses sessionStorage to track whether the prompt has already been shown
  // this browser session. Suppressed on /create since the user is already there.
  useAccountEffect({
    onConnect() {
      // Don't show if already on the create page
      if (pathname === "/create") return;
      // Don't re-show if already shown this session
      if (sessionStorage.getItem("deposit_connect_prompt_shown")) return;
      sessionStorage.setItem("deposit_connect_prompt_shown", "1");
      setShowLaunchPrompt(true);
    },
    onDisconnect() {
      // Clear the session flag so the prompt shows again next time they connect
      sessionStorage.removeItem("deposit_connect_prompt_shown");
    },
  });

  // ── Connector helpers (mobile) ─────────────────────────────────────────────
  /**
   * Find a connector by its well-known ID.
   * Returns undefined if the connector is not configured.
   */
  const findConnector = (id: string) =>
    connectors.find((c) => c.id === id || c.id.toLowerCase().includes(id.toLowerCase()));

  /**
   * Detect if user is ALREADY inside a wallet in-app browser.
   * In that case, we don't need to trigger WalletConnect — the injected
   * provider is available immediately (Rule 5 from guide).
   */
  const isInsideMetaMaskBrowser = () =>
    typeof window !== "undefined" && !!(window as any).ethereum?.isMetaMask;

  const isInsidePhantomBrowser = () =>
    typeof window !== "undefined" && !!(window as any).phantom?.ethereum?.isPhantom;

  /**
   * Trigger a specific wallet connector (mobile nav buttons).
   * Rule 3/4: Uses connect(connector) — wagmi creates the WalletConnect session,
   * the wallet opens automatically. NO manual deeplinks.
   */
  const connectWallet = (targetId: string, openConnectModal?: () => void) => {
    setIsMobileMenuOpen(false);

    // If already in the wallet browser, just open the generic modal
    if (
      (targetId === METAMASK_CONNECTOR_ID && isInsideMetaMaskBrowser()) ||
      (targetId === PHANTOM_CONNECTOR_ID && isInsidePhantomBrowser())
    ) {
      openConnectModal?.();
      return;
    }

    const connector = findConnector(targetId);
    if (connector) {
      // wagmi calls the connector → WalletConnect session created → wallet opens
      connect({ connector });
    } else {
      // Connector not configured, fall back to RainbowKit's full modal
      openConnectModal?.();
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-6 flex justify-center pointer-events-none">
      {/* Pill-shaped Navbar */}
      <div
        ref={navbarRef}
        className="w-full max-w-[1440px] flex items-center justify-between bg-white/5 backdrop-blur-md border border-white/10 rounded-full select-none pointer-events-auto shadow-lg"
        style={{ padding: "5px" }}
      >
        {/* LEFT: Logo + Desktop Links */}
        <div className="flex items-center gap-6 pl-2">
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #4a5cff 100%)" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L14 5V11L8 15L2 11V5L8 1Z" fill="#000000" strokeWidth="0" />
                <path d="M8 5v6M5 6.5l3-1.5 3 1.5" stroke="#6366f1" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-sm font-bold tracking-tight text-white font-heading group-hover:text-indigo-300 transition-colors">
              Deposit
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            {[
              { href: "/explore", label: "Explore" },
              { href: "/create", label: "Launch" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-xs font-sans font-medium text-gray-300 hover:text-white transition-colors duration-300"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* RIGHT: Desktop wallet button */}
        <div className="hidden md:flex items-center gap-6 pr-2">
          <span className="text-[11px] font-mono text-gray-400 hidden lg:inline uppercase tracking-wider">
            Securing Escrow Milestones
          </span>

          {/* Desktop: Custom ConnectButton with hover text roll */}
          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
              const connected = mounted && account && chain;
              return (
                <div
                  {...(!mounted && {
                    "aria-hidden": true,
                    style: { opacity: 0, pointerEvents: "none", userSelect: "none" },
                  })}
                >
                  <button
                    id="navbar-connect-btn"
                    onClick={connected ? openAccountModal : openConnectModal}
                    className="group flex items-center gap-3 bg-white hover:bg-gray-100 text-gray-900 text-[13px] font-medium rounded-full pl-5 pr-2 py-2 cursor-pointer transition-all duration-300"
                  >
                    <div className="h-[20px] overflow-hidden">
                      <div className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-[20px]">
                        <span className="h-[20px] flex items-center">
                          {connected ? account.displayName : "Connect Wallet"}
                        </span>
                        <span className="h-[20px] flex items-center">
                          {connected ? account.displayName : "Connect Wallet"}
                        </span>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:rotate-45">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </div>
                  </button>
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>

        {/* MOBILE: Menu toggle */}
        <div className="md:hidden pr-2">
          <button
            id="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="px-4 py-2 bg-white text-gray-900 text-xs font-semibold rounded-full flex items-center justify-center cursor-pointer select-none"
          >
            {isMobileMenuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu Overlay ─────────────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-end pointer-events-auto">
          <div
            className="mx-3 mb-3 bg-[#0c0d12] border border-white/10 rounded-2xl p-6 flex flex-col gap-8"
            style={{ transform: "translateY(0)" }}
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <span className="text-xs font-mono text-gray-400">DEPOSIT CROWD ESCROW</span>
            </div>

            <nav className="flex flex-col gap-4">
              {[
                { href: "/", label: "Discover Projects" },
                { href: "/explore", label: "Explore Campaigns" },
                { href: "/create", label: "Launch Campaign" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-sans font-medium text-white hover:text-indigo-400 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Mobile wallet connect section */}
            <div className="pt-4 flex flex-col gap-3">
              {/*
               * Mobile wallet buttons — Rule 4/5 from guide:
               * Each button triggers connect(connector) via wagmi.
               * WalletConnect creates the session, the wallet app opens.
               * NO window.location.href deeplinks.
               */}
              <ConnectButton.Custom>
                {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
                  const connected = mounted && account && chain;

                  if (connected) {
                    // Already connected: show account info + disconnect option
                    return (
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          openAccountModal?.();
                        }}
                        className="w-full py-4 bg-[#6366f1] hover:bg-[#4a5cff] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        {account.displayName}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </button>
                    );
                  }

                  // Not connected: show wallet-specific buttons that use connect(connector)
                  return (
                    <div className="flex flex-col gap-3 w-full">
                      {/* MetaMask — triggers MetaMask connector via wagmi */}
                      <button
                        id="mobile-connect-metamask"
                        onClick={() => connectWallet(METAMASK_CONNECTOR_ID, openConnectModal)}
                        className="w-full py-4 bg-[#f6851b] hover:bg-[#e2761b] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <svg width="20" height="20" viewBox="0 0 35 33" fill="none">
                          <path d="M32.9 1L19.4 10.7l2.5-5.9L32.9 1z" fill="#E17726" stroke="#E17726" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2.1 1l13.4 9.8-2.4-5.9L2.1 1z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        MetaMask
                      </button>

                      {/* Phantom — triggers Phantom connector via wagmi */}
                      <button
                        id="mobile-connect-phantom"
                        onClick={() => connectWallet(PHANTOM_CONNECTOR_ID, openConnectModal)}
                        className="w-full py-4 bg-[#ab9ff2] hover:bg-[#8a7be0] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <svg width="20" height="20" viewBox="0 0 128 128" fill="none">
                          <rect width="128" height="128" rx="26" fill="url(#phantom_grad)"/>
                          <defs><linearGradient id="phantom_grad" x1="0" y1="0" x2="128" y2="128"><stop stopColor="#534BB1"/><stop offset="1" stopColor="#551BF9"/></linearGradient></defs>
                          <path d="M110 65.5C110 89 91 109 67.5 109c-11.7 0-21.7-4.8-28.2-12.7a14.2 14.2 0 0 1-11.6 6.2C19.6 102.5 14 96.9 14 90s5.6-12.5 12.5-12.5c1.5 0 3 .3 4.3.7C31 72 34.7 66 40.8 62.1c.5-5.6 2.4-10.8 5.3-15.3C33.4 47.5 24 37.5 24 25.5a3 3 0 0 1 3-3c1.7 0 3 1.3 3 3 0 9.7 8 17.5 17.5 17.5s17.5-7.8 17.5-17.5a3 3 0 0 1 6 0c0 12-9.4 22-21.3 22.9C46 55 43.5 63 45.1 70.9c7-4 15.3-6.4 24.4-6.4C84.8 64.5 97 72.4 110 65.5z" fill="white"/>
                        </svg>
                        Phantom
                      </button>

                      {/* More wallets — opens RainbowKit's full WalletConnect modal */}
                      <button
                        id="mobile-connect-more"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          openConnectModal?.();
                        }}
                        className="w-full py-3 mt-1 bg-white/5 border border-white/10 text-white text-xs font-medium rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
                      >
                        More Wallets (WalletConnect)
                      </button>
                    </div>
                  );
                }}
              </ConnectButton.Custom>

              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-3 bg-white/5 border border-white/10 text-white text-xs font-medium rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
              >
                Close Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Post-connect "Launch Campaign?" modal ──────────────────────────── */}
      {/* Gated by sessionStorage — only shows once per session, never on refresh */}
      {showLaunchPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto p-4">
          <div className="bg-[#050508] border border-white/10 p-8 rounded-2xl shadow-2xl max-w-sm w-full relative overflow-hidden flex flex-col items-center text-center">
            {/* Ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/30 rounded-full blur-[40px] pointer-events-none" />

            {/* Connected check icon */}
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5 text-indigo-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-white font-heading mb-2">Wallet Connected</h3>
            <p className="text-sm text-slate-400 mb-8 font-sans">
              Would you like to launch a new escrow campaign, or stay here to explore?
            </p>

            <div className="flex flex-col w-full gap-3">
              <button
                id="launch-prompt-create"
                onClick={() => {
                  setShowLaunchPrompt(false);
                  router.push("/create");
                }}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25"
              >
                Launch Campaign
              </button>
              <button
                id="launch-prompt-stay"
                onClick={() => setShowLaunchPrompt(false)}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Stay Here
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
