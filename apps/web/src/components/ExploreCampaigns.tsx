"use client";

import React, { useState, useEffect, useMemo } from "react";
import { m } from "framer-motion";
import { useReadContract, useReadContracts, useChainId } from "wagmi";
import { formatEther } from "viem";
import { DepositEscrowABI, getContractAddress } from "@deposit/contracts";
import CampaignCard from "@/components/CampaignCard";

const MOCK_CAMPAIGNS = [
  {
    id: 1001,
    title: "Autonomous Web3 Shield",
    description: "A security firewall for smart contracts deployed on Base, verified via OpenAI auditor scans.",
    creator: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    goal: "5.0 ETH",
    totalFunded: "5.1 ETH",
    percentFunded: 102,
    deadlineStr: "Closed",
    currentMilestone: 1,
    totalMilestones: 3,
    trustScore: 98,
    isFailed: false,
    isCompleted: false,
  },
  {
    id: 1002,
    title: "DeFi Liquid Staking Mesh",
    description: "Decentralized staking optimization algorithm with automated validator rotation and gas limits.",
    creator: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    goal: "10.0 ETH",
    totalFunded: "8.5 ETH",
    percentFunded: 85,
    deadlineStr: "3 days left",
    currentMilestone: 1,
    totalMilestones: 2,
    trustScore: 94,
    isFailed: false,
    isCompleted: false,
  },
  {
    id: 1003,
    title: "Decentralized AI Agents Swarm",
    description: "Autonomous agent swarm execution network running sandboxed microservices on Base Sepolia.",
    creator: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    goal: "3.0 ETH",
    totalFunded: "1.2 ETH",
    percentFunded: 40,
    deadlineStr: "12 days left",
    currentMilestone: 0,
    totalMilestones: 3,
    trustScore: 91,
    isFailed: false,
    isCompleted: false,
  },
];

export default function ExploreCampaigns() {
  const chainId = useChainId();
  const contractAddress = useMemo(() => getContractAddress(chainId), [chainId]);

  // 1. Fetch total campaign count from smart contract
  const { data: campaignCount } = useReadContract({
    abi: DepositEscrowABI,
    address: contractAddress,
    functionName: "campaignCount",
  });

  const count = Number(campaignCount ?? BigInt(0));

  // 2. Prepare calls for each campaign index (1-based index)
  const contracts = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      abi: DepositEscrowABI,
      address: contractAddress,
      functionName: "campaigns",
      args: [BigInt(i + 1)],
    }));
  }, [count, contractAddress]);

  // 3. Fetch all campaigns in a single batch
  const { data: onChainCampaignsRaw, isLoading } = useReadContracts({
    contracts,
  });

  // 4. Map on-chain campaigns to CampaignCard format
  const [currentTime, setCurrentTime] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const onChainCampaigns = useMemo(() => {
    if (!onChainCampaignsRaw) return [];
    
    return onChainCampaignsRaw
      .map((res, index) => {
        if (!res.result) return null;
        
        const [
          creator,
          goal,
          deadline,
          totalFunded,
          currentMilestone,
          isFailed,
          isCompleted,
        ] = res.result as unknown as [string, bigint, bigint, bigint, bigint, boolean, boolean];

        const id = index + 1;
        const goalEth = parseFloat(formatEther(goal));
        const fundedEth = parseFloat(formatEther(totalFunded));
        const percent = goalEth > 0 ? Math.round((fundedEth / goalEth) * 100) : 0;
        
        const now = currentTime > 0 ? currentTime : Math.floor(new Date().getTime() / 1000); // Use state value if mounted
        const deadlineSec = Number(deadline);
        let deadlineText = "Expired";
        if (deadlineSec > now) {
          const hoursLeft = Math.ceil((deadlineSec - now) / 3600);
          if (hoursLeft > 24) {
            deadlineText = `${Math.ceil(hoursLeft / 24)} days left`;
          } else {
            deadlineText = `${hoursLeft}h left`;
          }
        }

        return {
          id,
          title: `Escrow Project #${id}`,
          description: `Crowdfunded project with milestones secure on Base. Click to view goals, fund the contract, and audit progress.`,
          creator,
          goal: `${goalEth.toFixed(2)} ETH`,
          totalFunded: `${fundedEth.toFixed(2)} ETH`,
          percentFunded: percent,
          deadlineStr: deadlineText,
          currentMilestone: Number(currentMilestone),
          totalMilestones: 3, 
          trustScore: 95,
          isFailed,
          isCompleted,
        };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);
  }, [onChainCampaignsRaw, currentTime]);

  const allCampaigns = useMemo(() => {
    return onChainCampaigns.length > 0 ? onChainCampaigns : MOCK_CAMPAIGNS;
  }, [onChainCampaigns]);

  return (
    <section id="explore" className="py-28 border-b border-white/5 bg-[#000000] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <m.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <span className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-widest block mb-2">
              Active Escrow Channels
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-white tracking-tight">
              Verified <span className="font-serif italic font-normal tracking-normal gradient-text-purple">Escrows</span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base mt-2 max-w-xl font-sans">
              Review verified proposals. Smart contracts enforce that funds are released on milestone completion.
            </p>
          </m.div>
          
          <m.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            className="mt-6 md:mt-0 flex gap-4 text-xs font-mono font-medium text-slate-400"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>On-Chain Sync</span>
            </div>
          </m.div>
        </div>

        {/* Campaign Grid */}
        {isLoading && onChainCampaigns.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-66 rounded-xl glass border border-white/5 animate-pulse flex flex-col justify-between p-6 bg-white/2">
                <div className="h-4 w-1/3 bg-white/10 rounded" />
                <div className="space-y-3">
                  <div className="h-6 w-full bg-white/10 rounded" />
                  <div className="h-4 w-5/6 bg-white/10 rounded" />
                </div>
                <div className="h-4 w-full bg-white/10 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {allCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} {...campaign} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
