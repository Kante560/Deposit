"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useReadContract, useReadContracts, useChainId } from "wagmi";
import { formatEther } from "viem";
import { DepositEscrowABI, getContractAddress } from "@deposit/contracts";
import CampaignCard from "@/components/CampaignCard";

export default function ExplorePage() {
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "failed">("active");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chainId = useChainId();
  const contractAddress = getContractAddress(chainId);

  // 1. Fetch total number of campaigns
  const { data: countData, isLoading: countLoading } = useReadContract({
    abi: DepositEscrowABI,
    address: contractAddress,
    functionName: "campaignCount",
  });

  const campaignCount = countData ? Number(countData) : 0;
  console.log("DEBUG: chainId=", chainId);
  console.log("DEBUG: contractAddress=", contractAddress);
  console.log("DEBUG: campaignCount=", campaignCount);

  // 2. Build the array of multicall contracts
  const contracts = useMemo(() => {
    const arr = [];
    for (let i = 1; i <= campaignCount; i++) {
      arr.push({
        abi: DepositEscrowABI,
        address: contractAddress,
        functionName: "campaigns",
        args: [BigInt(i)],
      });
    }
    return arr;
  }, [campaignCount, contractAddress]);

  // 3. Multicall all campaigns
  const { data: campaignsData, isLoading: campaignsLoading } = useReadContracts({
    contracts,
    query: {
      enabled: campaignCount > 0,
    },
  });

  // 4. Format campaigns
  const formattedCampaigns = useMemo(() => {
    if (!campaignsData) return [];

    return campaignsData
      .map((result, idx) => {
        if (result.status === "failure" || !result.result) return null;
        
        const [
          creator,
          goal,
          deadline,
          totalFunded,
          currentMilestone,
          isFailed,
          isCompleted,
        ] = result.result as [string, bigint, bigint, bigint, bigint, boolean, boolean];

        const goalEth = parseFloat(formatEther(goal));
        const fundedEth = parseFloat(formatEther(totalFunded));
        const percent = goalEth > 0 ? Math.round((fundedEth / goalEth) * 100) : 0;

        // Use a stable timestamp during SSR, only use Date.now() on client
        const now = mounted ? Math.floor(Date.now() / 1000) : 0;
        const deadlineSec = Number(deadline);
        let deadlineText = "Expired";
        
        if (!mounted) {
           deadlineText = "Calculating...";
        } else if (deadlineSec > now) {
          const hoursLeft = Math.ceil((deadlineSec - now) / 3600);
          if (hoursLeft > 24) {
            deadlineText = `${Math.ceil(hoursLeft / 24)} days left`;
          } else {
            deadlineText = `${hoursLeft}h left`;
          }
        }

        return {
          id: idx + 1, // IDs start at 1
          title: `Autonomous Project #${idx + 1}`,
          description: "Secured crowdfunding campaign on Base. Funds are locked in smart escrow and released incrementally upon verified technical milestones.",
          creator,
          goal: `${goalEth.toFixed(2)} ETH`,
          totalFunded: `${fundedEth.toFixed(2)} ETH`,
          percentFunded: percent,
          deadlineStr: deadlineText,
          currentMilestone: Number(currentMilestone),
          totalMilestones: 3, // Assuming 3 tranches by default for MVP
          trustScore: 90 + (idx % 10), // slight variation
          isFailed,
          isCompleted,
        };
      })
      .filter(Boolean)
      .reverse(); // Show newest first
  }, [campaignsData]);

  console.log("DEBUG: formattedCampaigns=", formattedCampaigns);
  console.log("DEBUG: filteredCampaigns length=", formattedCampaigns.filter(c => c && !c.isCompleted && !c.isFailed && c.deadlineStr !== "Expired").length);

  // 5. Apply the active filter
  const filteredCampaigns = useMemo(() => {
    return formattedCampaigns.filter((camp) => {
      if (!camp) return false;
      if (filter === "all") return true;
      if (filter === "active") return !camp.isCompleted && !camp.isFailed && camp.deadlineStr !== "Expired";
      if (filter === "completed") return camp.isCompleted;
      if (filter === "failed") return camp.isFailed || (camp.deadlineStr === "Expired" && !camp.isCompleted);
      return true;
    });
  }, [formattedCampaigns, filter, mounted]);

  const isLoading = !mounted || countLoading || (campaignCount > 0 && campaignsLoading);

  return (
    <div className="flex-1 bg-obsidian pt-32 pb-24 px-6 relative z-10 w-full">
      {/* Background glowing gradients */}
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none -z-10" />
      <div className="absolute -top-40 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto w-full">
        {/* Page Header */}
        <div className="flex flex-col items-center justify-center text-center mb-16">
          <span className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-400/10 border border-indigo-400/20 mb-4 inline-block">
            Decentralized Funding
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold font-heading text-glow-purple tracking-tight mb-4">
            Explore Campaigns
          </h1>
          <p className="text-slate-400 max-w-2xl text-sm md:text-base font-sans mb-10">
            Discover cutting-edge Web3 projects backed by automated AI Oracle verification. Your funds are secured in escrow and only released upon successful technical milestones.
          </p>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-2xl w-full max-w-md mx-auto">
            {(["active", "all", "completed", "failed"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`flex-1 py-2 px-4 rounded-xl text-xs md:text-sm font-semibold capitalize transition-all duration-300 ${
                  filter === tab
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Skeletons */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-96 rounded-2xl bg-white/5 border border-white/5 animate-pulse flex flex-col p-6">
                <div className="h-4 w-1/3 bg-white/10 rounded mb-4" />
                <div className="h-6 w-3/4 bg-white/10 rounded mb-4" />
                <div className="h-10 w-full bg-white/10 rounded mb-auto" />
                <div className="h-2 w-full bg-white/10 rounded mt-6" />
              </div>
            ))}
          </div>
        ) : filteredCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((camp) => (
              <CampaignCard key={camp!.id} {...camp!} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white/5 border border-white/10 rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-slate-500">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">No Campaigns Yet</h3>
            <p className="text-slate-400 mb-6 text-sm">Be the first to launch an AI-verified escrow campaign.</p>
            <a href="/create" className="btn-primary inline-flex">
              Launch Campaign
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
