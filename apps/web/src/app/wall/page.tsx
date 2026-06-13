"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import GlassCard from "@/components/GlassCard";
import {
  ShieldCheck,
  ShieldAlert,
  Copy,
  ExternalLink,
  Search,
  RefreshCw,
  Lock,
  Wallet,
  Calendar,
  Activity,
  Check,
  Users,
} from "lucide-react";

interface ConnectedWallet {
  address: string;
  firstConnected: string;
  lastConnected: string;
  connectionCount: number;
}

const AUTHORIZED_ADMIN = "0x68d0f9286195723e56429ed09F50966f4344b5B7".toLowerCase();

export default function AdminPage() {
  const { address: wagmiAddress, isConnected: wagmiIsConnected } = useAccount();
  const [mockAddress, setMockAddress] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [wallets, setWallets] = useState<ConnectedWallet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    
    // Parse mock address if present in URL search parameters
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const mock = params.get("mockAddress");
      if (mock) {
        setMockAddress(mock);
      }
    }
  }, []);

  const address = mockAddress || wagmiAddress;
  const isConnected = !!mockAddress || wagmiIsConnected;

  const isAdmin = isConnected && address?.toLowerCase() === AUTHORIZED_ADMIN;

  // Fetch connected wallets from API
  useEffect(() => {
    if (!mounted || !isAdmin) return;

    async function fetchWallets() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/wallets?adminAddress=${address}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch wallets");
        }
        const data = await res.json();
        setWallets(data.wallets || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchWallets();
  }, [mounted, isAdmin, address, refreshTrigger]);

  // Handle address copy
  const handleCopy = (walletAddress: string, index: number) => {
    navigator.clipboard.writeText(walletAddress);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Filtered wallets based on search query
  const filteredWallets = useMemo(() => {
    return wallets.filter((w) =>
      w.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [wallets, searchQuery]);

  // Format date helper
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Case 1: Wallet Not Connected ───────────────────────────────────────────
  if (!isConnected) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-20 relative">
        {/* Glow ambient backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-md w-full relative z-10">
          <GlassCard className="text-center p-8 border border-white/5 shadow-2xl relative overflow-hidden">
            {/* Inner background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-indigo-500/10 rounded-full blur-[40px]" />

            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-6 text-indigo-400">
              <Lock className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-extrabold font-heading text-white mb-3 tracking-tight">
              Admin Access Required
            </h1>
            <p className="text-slate-400 text-sm font-sans leading-relaxed mb-8">
              This panel displays sensitive administrative connection telemetry. Please connect the authorized admin wallet to proceed.
            </p>

            <div className="flex justify-center">
              <ConnectButton
                label="Connect Admin Wallet"
                showBalance={false}
                chainStatus="none"
              />
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-mono">
              <span>Authorized:</span>
              <span className="text-indigo-300">0x68d0...b5B7</span>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  // ── Case 2: Connected but Not Admin ────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-20 relative">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-950/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-md w-full relative z-10">
          <GlassCard className="text-center p-8 border border-red-500/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-red-500/10 rounded-full blur-[40px]" />

            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6 text-red-400">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-extrabold font-heading text-white mb-2 tracking-tight">
              Access Denied
            </h1>
            <p className="text-red-300/80 text-xs font-mono mb-6 bg-red-500/5 py-2 px-3 rounded-lg border border-red-500/10 break-all">
              Connected: {address}
            </p>
            <p className="text-slate-400 text-sm font-sans leading-relaxed mb-8">
              Your wallet is not authorized to access this administration page. Please switch to the designated administrator address.
            </p>

            <div className="flex flex-col gap-3">
              <div className="flex justify-center">
                <ConnectButton
                  label="Switch Wallet"
                  showBalance={false}
                  chainStatus="none"
                />
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-3">
                Expected Address: <span className="text-red-400">0x68d0f9286195723e56429ed09F50966f4344b5B7</span>
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  // ── Case 3: Connected & Authorized (Admin Dashboard) ──────────────────────
  return (
    <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 mt-16">
      {/* Background glow effects */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-1/4 w-[350px] h-[350px] bg-violet-900/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Secured Admin Dashboard</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-heading text-white">
            Connection Telemetry
          </h1>
          <p className="text-slate-400 text-sm font-sans mt-1">
            Real-time audit log of all wallets that have initiated connection with the platform.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setRefreshTrigger((prev) => prev + 1)}
            disabled={isLoading}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono py-2 px-4 rounded-full flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Admin Active</span>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <GlassCard className="p-6 flex items-center justify-between border-white/5">
          <div>
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
              Total Recorded Wallets
            </span>
            <span className="text-3xl font-bold font-heading text-white">
              {wallets.length}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex items-center justify-between border-white/5">
          <div>
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
              Total Interactions
            </span>
            <span className="text-3xl font-bold font-heading text-white">
              {wallets.reduce((acc, curr) => acc + curr.connectionCount, 0)}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <Activity className="w-6 h-6" />
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex items-center justify-between border-white/5">
          <div>
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
              Admin Wallet Address
            </span>
            <span className="text-sm font-mono text-indigo-300 block truncate max-w-[200px] mt-2">
              0x68d0...b5B7
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </GlassCard>
      </div>

      {/* Main Table Panel */}
      <GlassCard className="p-0 border-white/5 overflow-hidden">
        {/* Table Controls */}
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row items-center gap-4 bg-white/[0.01]">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by wallet address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 focus:border-indigo-500/50 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all font-sans"
            />
          </div>

          <div className="ml-auto text-xs text-slate-500 font-mono">
            Showing {filteredWallets.length} of {wallets.length} entries
          </div>
        </div>

        {/* Data Table */}
        <div className="w-full overflow-x-auto">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-400 font-mono">Fetching database payload...</span>
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <p className="text-red-400 text-sm font-mono mb-2">Error: {error}</p>
              <button
                onClick={() => setRefreshTrigger((prev) => prev + 1)}
                className="btn-glass text-xs py-1.5 px-4"
              >
                Retry
              </button>
            </div>
          ) : filteredWallets.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm font-sans">
              No wallet connections matching your search query were found.
            </div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01] text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">Wallet Address</th>
                  <th className="py-4 px-6 font-semibold">First Connected</th>
                  <th className="py-4 px-6 font-semibold text-center">Connection Count</th>
                  <th className="py-4 px-6 font-semibold">Last Active Connection</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-sans">
                {filteredWallets.map((wallet, index) => (
                  <tr
                    key={wallet.address}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Wallet Address */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-400 font-mono font-bold text-[10px]">
                          {index + 1}
                        </div>
                        <span className="font-mono text-slate-200 group-hover:text-white transition-colors">
                          {wallet.address}
                        </span>
                      </div>
                    </td>

                    {/* First Connected */}
                    <td className="py-4 px-6 text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{formatDate(wallet.firstConnected)}</span>
                      </div>
                    </td>

                    {/* Connection Count */}
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono font-bold text-2xs">
                        {wallet.connectionCount}
                      </span>
                    </td>

                    {/* Last Connected */}
                    <td className="py-4 px-6 text-slate-400">
                      <div className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-slate-500" />
                        <span>{formatDate(wallet.lastConnected)}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Copy Address */}
                        <button
                          onClick={() => handleCopy(wallet.address, index)}
                          className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                          title="Copy Wallet Address"
                        >
                          {copiedIndex === index ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Etherscan Link */}
                        <a
                          href={`https://sepolia.basescan.org/address/${wallet.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                          title="View on BaseScan"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
