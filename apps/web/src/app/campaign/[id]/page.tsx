"use client";

import React, { useState, useMemo, use } from "react";
import { useReadContract, useWriteContract, useAccount, useChainId } from "wagmi";
import { formatEther, parseEther } from "viem";
import { DepositEscrowABI, getContractAddress } from "@deposit/contracts";
import GlassCard from "@/components/GlassCard";
import OracleModal from "@/components/OracleModal";

// ─── Mock Database records fallback ─────────────────────────────────────────
const MOCK_CAMPAIGNS = [
  {
    id: 1001,
    title: "Autonomous Web3 Shield",
    description: "A security firewall for smart contracts deployed on Base, verified via OpenAI auditor scans. The shield evaluates code safety and blocks reentrancy hooks automatically.",
    creator: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    goal: "5.0 ETH",
    totalFunded: "5.1 ETH",
    percentFunded: 102,
    deadlineStr: "Closed",
    currentMilestone: 1,
    trustScore: 98,
    isFailed: false,
    isCompleted: false,
    isExpired: true,
    milestones: [
      { promise: "Build MVP alpha core framework", percentage: 30, isApproved: true },
      { promise: "Integrate dashboard and contracts logic", percentage: 30, isApproved: false },
      { promise: "Deploy live dApp and release user tests", percentage: 40, isApproved: false },
    ],
  },
  {
    id: 1002,
    title: "DeFi Liquid Staking Mesh",
    description: "Decentralized staking optimization algorithm with automated validator rotation, slippage safeguards, and automated reward compounding on Base.",
    creator: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    goal: "10.0 ETH",
    totalFunded: "8.5 ETH",
    percentFunded: 85,
    deadlineStr: "3 days left",
    currentMilestone: 1,
    trustScore: 94,
    isFailed: false,
    isCompleted: false,
    isExpired: false,
    milestones: [
      { promise: "Smart contracts complete and audited", percentage: 50, isApproved: true },
      { promise: "Frontend dApp integration complete", percentage: 50, isApproved: false },
    ],
  },
  {
    id: 1003,
    title: "Decentralized AI Agents Hub",
    description: "Autonomous agent swarm execution network running sandboxed microservices on Base Sepolia. Enables off-chain computing with on-chain dispute settlement.",
    creator: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    goal: "3.0 ETH",
    totalFunded: "1.2 ETH",
    percentFunded: 40,
    deadlineStr: "12 days left",
    currentMilestone: 0,
    trustScore: 91,
    isFailed: false,
    isCompleted: false,
    isExpired: false,
    milestones: [
      { promise: "Architecture layout and consensus draft", percentage: 20, isApproved: true },
      { promise: "Docker image for host node released", percentage: 30, isApproved: false },
      { promise: "Production dashboard and node runner portal", percentage: 50, isApproved: false },
    ],
  },
];

export default function CampaignDetail({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const campaignId = Number(unwrappedParams.id);

  const chainId = useChainId();
  const account = useAccount();
  const contractAddress = getContractAddress(chainId);

  // Modal control
  const [isOracleModalOpen, setIsOracleModalOpen] = useState(false);
  const [fundingAmount, setFundingAmount] = useState("0.1");
  const [isFunding, setIsFunding] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);

  // Blockchain interaction hooks
  const { writeContractAsync } = useWriteContract();

  // 1. Check if campaign is on-chain or mock fallback
  const isMockCampaign = campaignId > 1000;

  // 2. Fetch campaign details on-chain (if not mock)
  const { data: onChainCampaignData, refetch } = useReadContract({
    abi: DepositEscrowABI,
    address: contractAddress,
    functionName: "campaigns",
    args: isMockCampaign ? undefined : [BigInt(campaignId)],
    query: {
      enabled: !isMockCampaign,
    },
  });

  // 3. Fetch user contribution balance for refund claims
  const { data: userContribution } = useReadContract({
    abi: DepositEscrowABI,
    address: contractAddress,
    functionName: "contributions",
    args: isMockCampaign || !account.address ? undefined : [BigInt(campaignId), account.address],
    query: {
      enabled: !isMockCampaign && !!account.address,
    },
  });

  // 4. Resolve campaign data
  const campaign = useMemo(() => {
    if (isMockCampaign) {
      return MOCK_CAMPAIGNS.find((c) => c.id === campaignId) ?? null;
    }

    if (!onChainCampaignData) return null;

    const [
      creator,
      goal,
      deadline,
      totalFunded,
      currentMilestone,
      isFailed,
      isCompleted,
    ] = onChainCampaignData as [string, bigint, bigint, bigint, bigint, boolean, boolean];

    const goalEth = parseFloat(formatEther(goal));
    const fundedEth = parseFloat(formatEther(totalFunded));
    const percent = goalEth > 0 ? Math.round((fundedEth / goalEth) * 100) : 0;
    
    const now = Math.floor(Date.now() / 1000);
    const deadlineSec = Number(deadline);
    let deadlineText = "Expired";
    let isExpired = now >= deadlineSec;
    if (deadlineSec > now) {
      const hoursLeft = Math.ceil((deadlineSec - now) / 3600);
      if (hoursLeft > 24) {
        deadlineText = `${Math.ceil(hoursLeft / 24)} days left`;
      } else {
        deadlineText = `${hoursLeft}h left`;
      }
    }

    // Default tranches for on-chain created campaigns
    const milestones = [
      { promise: "Build MVP alpha core framework", percentage: 30, isApproved: Number(currentMilestone) > 0 },
      { promise: "Integrate dashboard and contracts logic", percentage: 30, isApproved: Number(currentMilestone) > 1 },
      { promise: "Deploy live dApp and release user tests", percentage: 40, isApproved: Number(currentMilestone) > 2 },
    ];

    return {
      id: campaignId,
      title: `Escrow Project #${campaignId}`,
      description: `Secured crowdfunding campaign on Base. This contract uses automated milestone audit release. Funds are locked in escrow and released incrementally.`,
      creator,
      goal: `${goalEth.toFixed(2)} ETH`,
      totalFunded: `${fundedEth.toFixed(2)} ETH`,
      percentFunded: percent,
      deadlineStr: deadlineText,
      isExpired,
      currentMilestone: Number(currentMilestone),
      trustScore: 95,
      isFailed,
      isCompleted,
      milestones,
      rawTotalFunded: totalFunded,
      rawGoal: goal,
    };
  }, [onChainCampaignData, campaignId, isMockCampaign]);

  if (!campaign) {
    return (
      <div className="flex-1 flex items-center justify-center bg-obsidian py-24">
        <div className="text-center">
          <p className="text-slate-500 font-mono text-sm mb-4">Error 404</p>
          <h2 className="text-2xl font-bold mb-2">Campaign Not Found</h2>
          <p className="text-slate-400 text-sm">Make sure the ID is correct and your wallet is synced.</p>
        </div>
      </div>
    );
  }

  // Creator check
  const isCreator = account.address?.toLowerCase() === campaign.creator.toLowerCase();

  // Escrow contribution action
  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account.isConnected) {
      alert("Please connect your wallet first.");
      return;
    }
    if (isMockCampaign) {
      alert("This is a mock project and does not accept real on-chain contributions.");
      return;
    }

    setIsFunding(true);
    try {
      const value = parseEther(fundingAmount);
      const tx = await writeContractAsync({
        abi: DepositEscrowABI,
        address: contractAddress,
        functionName: "fund",
        args: [BigInt(campaignId)],
        value,
      });

      console.log("Funding transaction sent:", tx);
      alert(`Funding successful! Transaction sent: ${tx}`);
      setFundingAmount("0.1");
      refetch();
    } catch (err) {
      console.error("Funding error:", err);
      alert("Funding failed. See console for details.");
    } finally {
      setIsFunding(false);
    }
  };

  // Refund claim action
  const handleClaimRefund = async () => {
    if (isMockCampaign) return;
    setIsRefunding(true);
    try {
      const tx = await writeContractAsync({
        abi: DepositEscrowABI,
        address: contractAddress,
        functionName: "claimRefund",
        args: [BigInt(campaignId)],
      });
      console.log("Refund transaction sent:", tx);
      alert(`Refund claimed! Transaction hash: ${tx}`);
      refetch();
    } catch (err) {
      console.error("Refund error:", err);
      alert("Refund claim failed. Ensure you are eligible.");
    } finally {
      setIsRefunding(false);
    }
  };

  const currentPromise = campaign.milestones[campaign.currentMilestone]?.promise ?? "";

  return (
    <div className="flex-1 bg-obsidian pt-28 pb-16 px-6 max-w-7xl mx-auto w-full flex flex-col gap-12">
      
      {/* Detail header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-widest px-2.5 py-1 rounded bg-indigo-400/10 border border-indigo-400/20">
              Escrow Active
            </span>
            <div className="trust-badge">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M8 1.5L2 4v4.5c0 3 2.5 5.5 6 6.5 3.5-1 6-4 6-6.5V4l-6-2.5z" fill="rgba(52, 211, 153, 0.1)" stroke="#34D399" strokeWidth="1.2" />
                <path d="M5.5 8l1.5 1.5 3.5-3.5" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{campaign.trustScore}% Community Trust</span>
            </div>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-glow-purple tracking-tight">
            {campaign.title}
          </h2>
          <p className="text-slate-400 font-mono text-xs mt-3 flex items-center gap-2">
            <span>Creator:</span>
            <span className="text-slate-200 select-all font-semibold bg-white/5 px-2 py-0.5 rounded">{campaign.creator}</span>
          </p>
        </div>

        {campaign.isCompleted && (
          <div className="mt-4 md:mt-0 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[#34D399] font-bold text-sm">
            ✓ Campaign Completed Successfully
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Left 2 cols: Campaign Info & Milestones */}
        <div className="lg:col-span-2 flex flex-col gap-10">
          
          {/* Main Description */}
          <GlassCard className="border-white/10">
            <h3 className="text-xl font-bold mb-4 font-heading">Project Concept</h3>
            <p className="text-slate-300 leading-relaxed font-sans text-sm md:text-base">
              {campaign.description}
            </p>
          </GlassCard>

          {/* Milestones timeline */}
          <GlassCard className="border-white/10">
            <h3 className="text-xl font-bold mb-6 font-heading">Escrow Milestones Timeline</h3>
            <p className="text-slate-400 text-xs mb-8 font-sans">
              Smart escrow releasing funds in tranches after technical verification.
            </p>

            <div className="relative border-l border-white/10 ml-4 pl-8 flex flex-col gap-8">
              {campaign.milestones.map((m, idx) => {
                const isApproved = idx < campaign.currentMilestone;
                const isCurrent = idx === campaign.currentMilestone && !campaign.isCompleted && !campaign.isFailed;
                const isLocked = idx > campaign.currentMilestone || campaign.isFailed || campaign.isCompleted;

                return (
                  <div key={idx} className="relative">
                    {/* Node status dot */}
                    <div
                      className={`absolute -left-[41px] top-1.5 w-6 h-6 rounded-full border flex items-center justify-center ${
                        isApproved
                          ? "bg-emerald-500/20 border-emerald-500"
                          : isCurrent
                          ? "bg-indigo-400/20 border-indigo-400"
                          : "bg-black/80 border-white/10"
                      }`}
                    >
                      {isApproved ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      ) : isCurrent ? (
                        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                      )}
                    </div>

                    <div>
                      {/* Milestone Header */}
                      <div className="flex justify-between items-center mb-2">
                        <h4 className={`text-sm font-bold tracking-tight ${isCurrent ? "text-indigo-400" : "text-white"}`}>
                          Milestone #{idx + 1}: {m.promise}
                        </h4>
                        <span className="font-mono text-xs text-slate-500 font-semibold">{m.percentage}% Tranche</span>
                      </div>

                      {/* Milestone details & Actions */}
                      <p className="text-xs text-slate-400 font-sans mb-4">
                        Funds allocation: {m.percentage}% of total pool. Releases on AI Oracle check.
                      </p>

                      <div className="flex justify-between items-center">
                        {isApproved ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#34D399] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                            Approved & Released
                          </span>
                        ) : isCurrent ? (
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-400/10 border border-indigo-400/20 px-2 py-0.5 rounded animate-pulse">
                              Pending Audit
                            </span>
                            {isCreator && (
                              <button
                                onClick={() => setIsOracleModalOpen(true)}
                                className="text-xs font-bold font-mono text-indigo-400 hover:text-indigo-300 border border-indigo-400/30 hover:border-indigo-400 px-3 py-1 rounded transition-colors cursor-pointer"
                              >
                                Submit Evidence
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded">
                            {campaign.isFailed ? "Escrow Locked" : "Locked"}
                          </span>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

        </div>

        {/* Right col: Funding Status card & refund */}
        <div className="flex flex-col gap-8">
          
          {/* Funding Status Board */}
          <GlassCard className="border-white/10 flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-bold mb-1 font-heading">Funding Status</h3>
              <p className="text-xs text-slate-500 font-sans">Required goal to release milestones.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-6">
              <div>
                <span className="block text-[10px] uppercase text-slate-500 tracking-wider">Raised</span>
                <span className="text-2xl font-bold font-mono text-glow-purple text-white">{campaign.totalFunded}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-slate-500 tracking-wider">Goal</span>
                <span className="text-2xl font-bold font-mono text-slate-300">{campaign.goal}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-slate-400">Total Funded Percentage</span>
                <span className="text-indigo-400">{campaign.percentFunded}%</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${Math.min(campaign.percentFunded, 100)}%` }}
                />
              </div>
            </div>

            {/* Extra details */}
            <div className="flex justify-between items-center text-xs font-mono text-slate-500">
              <span>Timeframe</span>
              <span className="text-slate-300">{campaign.deadlineStr}</span>
            </div>

            {/* Fund action form (If campaign is open & not fully funded) */}
            {!campaign.isCompleted && !campaign.isFailed && !campaign.isExpired && (
              <form onSubmit={handleFund} className="border-t border-white/5 pt-6 flex flex-col gap-4">
                <div>
                  <label className="text-[10px] uppercase text-slate-500 tracking-wider block mb-2 font-mono">
                    Contribution Amount (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.001"
                    required
                    value={fundingAmount}
                    onChange={(e) => setFundingAmount(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400 transition-colors font-mono"
                  />
                </div>

                {!account.isConnected ? (
                  <div className="text-[11px] text-center text-slate-400 p-2 bg-indigo-500/10 border border-indigo-500/20 rounded">
                    🔌 Connect wallet in Navbar to fund.
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={isFunding}
                    className="btn-primary w-full glow-purple"
                  >
                    {isFunding ? "Broadcasting..." : "Escrow Contribution"}
                  </button>
                )}
              </form>
            )}

            {/* Seed project info */}
            {isMockCampaign && (
              <div className="bg-indigo-400/5 border border-indigo-400/10 rounded-lg p-3 text-[11px] text-slate-400 font-sans">
                💡 This is a design demo project. Launch your own project to test actual smart contract integrations.
              </div>
            )}
          </GlassCard>

          {/* Refund panel (If campaign failed audit or missed goal) */}
          {!isMockCampaign && (campaign.isFailed || (campaign.isExpired && campaign.percentFunded < 100)) && (
            <GlassCard className="border-red-500/20 bg-red-500/5 shadow-[0_0_30px_rgba(239,68,68,0.05)]">
              <h3 className="text-sm font-bold text-red-400 mb-2 uppercase tracking-wider font-mono">
                Contributor Refund Protocol
              </h3>
              <p className="text-xs text-slate-400 font-sans mb-4 leading-relaxed">
                This project {campaign.isFailed ? "failed its AI Oracle milestone audit" : "missed its funding goal before deadline"}. Contributors are entitled to retrieve 100% of their escrowed funds.
              </p>

              {userContribution !== undefined && Number(userContribution) > 0 ? (
                <div>
                  <div className="bg-black/30 border border-white/5 rounded p-3 mb-4 flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-500">Your Escrowed Balance</span>
                    <span className="text-white font-bold">{formatEther(userContribution as bigint)} ETH</span>
                  </div>
                  <button
                    onClick={handleClaimRefund}
                    disabled={isRefunding}
                    className="w-full py-2.5 text-xs text-black font-bold uppercase tracking-wider bg-red-400 rounded-lg hover:bg-red-300 transition-colors cursor-pointer"
                  >
                    {isRefunding ? "Claiming..." : "Claim Refund"}
                  </button>
                </div>
              ) : (
                <div className="bg-black/20 border border-white/5 rounded p-3 text-center text-xs text-slate-500 font-sans">
                  No contributions found for this address.
                </div>
              )}
            </GlassCard>
          )}

        </div>
      </div>

      {/* ─── Oracle Modal Integration ─────────────────────────────────────── */}
      <OracleModal
        isOpen={isOracleModalOpen}
        onClose={() => setIsOracleModalOpen(false)}
        campaignId={campaignId}
        originalPromise={currentPromise}
        onSuccess={() => {
          // Refresh data
          setTimeout(() => refetch(), 1000);
        }}
      />
    </div>
  );
}
