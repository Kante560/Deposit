"use client";

import React, { useState, useRef } from "react";
import { useWriteContract, useChainId, useAccount } from "wagmi";
import { parseEther } from "viem";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { DepositEscrowABI, getContractAddress } from "@deposit/contracts";
import GlassCard from "@/components/GlassCard";

gsap.registerPlugin(useGSAP);

interface MilestoneInput {
  promise: string;
  percentage: number;
}

export default function CreateCampaign() {
  const router = useRouter();
  const chainId = useChainId();
  const account = useAccount();
  const contractAddress = getContractAddress(chainId);

  // Form states
  const [title, setTitle] = useState("");
  const [ideaDump, setIdeaDump] = useState("");
  const [goal, setGoal] = useState("1.5");
  const [durationDays, setDurationDays] = useState("7");
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { promise: "Build MVP alpha core framework", percentage: 30 },
    { promise: "Integrate dashboard and contracts logic", percentage: 30 },
    { promise: "Deploy live dApp and release user tests", percentage: 40 },
  ]);

  // AI pitch output & animation states
  const [generatedPitch, setGeneratedPitch] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [txHash, setTxHash] = useState("");

  const pageRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // contract writing
  const { writeContractAsync } = useWriteContract();

  // Entrance animations
  useGSAP(() => {
    gsap.from(".anim-fade-up", {
      y: 30,
      autoAlpha: 0,
      duration: 0.6,
      stagger: 0.15,
      ease: "power2.out",
    });
  }, { scope: pageRef });

  // Add/remove milestones
  const addMilestone = () => {
    if (milestones.length >= 5) return;
    setMilestones([...milestones, { promise: "", percentage: 0 }]);
  };

  const removeMilestone = (index: number) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: keyof MilestoneInput, value: string | number) => {
    const updated = [...milestones];
    if (field === "percentage") {
      updated[index].percentage = Math.max(0, Math.min(100, Number(value)));
    } else {
      updated[index].promise = String(value);
    }
    setMilestones(updated);
  };

  const totalPercentage = milestones.reduce((sum, m) => sum + m.percentage, 0);

  // Simulate AI Pitch Generation with a typewriter streaming effect
  const handleGeneratePitch = () => {
    if (!title.trim() || !ideaDump.trim()) return;
    setIsGenerating(true);
    setGeneratedPitch("");

    const fullPitch = `# ${title}

## Executive Summary
Based on the provided concepts, this campaign aims to construct a highly resilient infrastructure for *${ideaDump}*. Built entirely on the Base blockchain network, all milestone funds are locked in Escrow.

## Technical Milestones

${milestones
  .map(
    (m, idx) => `### Milestone ${idx + 1}: ${m.promise} (${m.percentage}% Tranche)
The AI Oracle will verify milestone delivery by scanning public GitHub repositories, verifying tests logs, or analyzing production website endpoints.`
  )
  .join("\n\n")}

## Funding Analysis
- **Target Funding:** ${goal} ETH
- **Lock Escrow Address:** ${contractAddress}
- **Milestone Distribution:** Release-on-Verification protocol.`;

    let i = 0;
    const speed = 12; // ms per char
    
    // Smooth scroll in the preview panel
    if (previewRef.current) {
      gsap.to(previewRef.current, {
        scrollTop: previewRef.current.scrollHeight,
        duration: 0.3,
      });
    }

    const typeWriter = () => {
      if (i < fullPitch.length) {
        setGeneratedPitch((prev) => prev + fullPitch.charAt(i));
        i++;
        setTimeout(typeWriter, speed);
      } else {
        setIsGenerating(false);
      }
    };

    typeWriter();
  };

  // Deploy to Smart Contract
  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account.isConnected) {
      alert("Please connect your wallet first.");
      return;
    }
    if (totalPercentage !== 100) {
      alert("Milestone percentages must sum up exactly to 100%");
      return;
    }

    setIsDeploying(true);

    try {
      const goalWei = parseEther(goal);
      const durationSec = BigInt(Number(durationDays) * 24 * 3600);
      const tranches = milestones.map((m) => BigInt(m.percentage));

      console.log("Deploying campaign:", { goalWei, durationSec, tranches });

      const hash = await writeContractAsync({
        abi: DepositEscrowABI,
        address: contractAddress,
        functionName: "createCampaign",
        args: [goalWei, durationSec, tranches],
      });

      setTxHash(hash);
      
      // Let it simulate mining then redirect to the detail page (our mock campaign IDs start at 1, on-chain will start at 1 too)
      // Since it's local development, let's wait a couple of seconds
      setTimeout(() => {
        setIsDeploying(false);
        // Usually, the first on-chain campaign has ID 1. Let's redirect there.
        router.push("/");
      }, 3000);
      
    } catch (err) {
      console.error("Failed to deploy campaign:", err);
      alert("Failed to submit transaction to Base. See console for details.");
      setIsDeploying(false);
    }
  };

  return (
    <div ref={pageRef} className="flex-1 min-h-screen bg-obsidian pt-24 md:pt-28 pb-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
      <div className="mb-10 md:mb-12 anim-fade-up">
        <span className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-widest block mb-2">
          Base Launchpad
        </span>
        <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-glow-purple tracking-tight">
          Launch Escrow Campaign
        </h2>
        <p className="text-slate-400 text-sm md:text-base mt-2 max-w-xl font-sans">
          Define goals, customize milestones, and leverage our AI Oracle to gain contributor trust.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Left Column: Form config */}
        <div className="anim-fade-up">
          <GlassCard className="border-white/10">
            <form onSubmit={handleDeploy} className="flex flex-col gap-6">
              
              {/* Campaign Title */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Campaign Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Autonomous Web3 Shield"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-400 transition-colors placeholder:text-slate-600"
                />
              </div>

              {/* AI Idea Dump */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    AI Pitch Idea & Prompt
                  </label>
                  {title && ideaDump && (
                    <button
                      type="button"
                      onClick={handleGeneratePitch}
                      disabled={isGenerating}
                      className="text-xs font-mono font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                        <polyline points="2 17 12 22 22 17"></polyline>
                        <polyline points="2 12 12 17 22 12"></polyline>
                      </svg>
                      {isGenerating ? "Streaming..." : "Generate AI Pitch"}
                    </button>
                  )}
                </div>
                <textarea
                  required
                  rows={4}
                  placeholder="Summarize your technical implementation, target repo links, or features. The AI Oracle will analyze this to generate your campaign proposal."
                  value={ideaDump}
                  onChange={(e) => setIdeaDump(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-400 transition-colors placeholder:text-slate-600 font-sans"
                />
              </div>

              {/* Goal & Duration Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Goal Target (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-400 transition-colors"
                  />
                </div>
              </div>

              {/* Milestone Builder */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Escrow Milestones
                  </label>
                  <button
                    type="button"
                    onClick={addMilestone}
                    className="text-xs font-mono font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    + Add Step
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {milestones.map((milestone, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-3 sm:items-center bg-white/2 border border-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 w-full sm:flex-1">
                        <div className="font-mono text-xs text-slate-500 font-bold w-6">#{idx + 1}</div>
                        <input
                          type="text"
                          required
                          placeholder="Define what will be verified"
                          value={milestone.promise}
                          onChange={(e) => updateMilestone(idx, "promise", e.target.value)}
                          className="flex-1 w-full bg-black/30 border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-400 transition-colors placeholder:text-slate-700"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-start gap-3 pl-8 sm:pl-0">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            required
                            value={milestone.percentage}
                            onChange={(e) => updateMilestone(idx, "percentage", e.target.value)}
                            className="w-16 bg-black/30 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-400 transition-colors text-center font-mono"
                          />
                          <span className="text-xs text-slate-500 font-bold">%</span>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => removeMilestone(idx)}
                          className="text-slate-500 hover:text-red-400 transition-colors p-1 flex-shrink-0"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Milestone validation details */}
                <div className="flex justify-between items-center mt-3 text-xs">
                  <span className="text-slate-500">Total Release Percentage</span>
                  <span className={`font-mono font-bold ${totalPercentage === 100 ? "text-[#34D399]" : "text-red-400"}`}>
                    {totalPercentage}% / 100%
                  </span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="border-t border-white/5 pt-6 flex flex-col gap-4">
                {!account.isConnected ? (
                  <div className="text-center text-sm text-slate-400 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                    🔌 Please connect your wallet using the Navbar button to launch.
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={isDeploying || totalPercentage !== 100}
                    className="btn-primary w-full glow-purple disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isDeploying ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="16"></circle>
                        </svg>
                        Deploying Campaign to Base...
                      </span>
                    ) : (
                      "Launch Campaign on Base"
                    )}
                  </button>
                )}

                {txHash && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center">
                    <p className="text-xs text-[#34D399] font-bold mb-1">Transaction Broadcasted!</p>
                    <span className="font-mono text-[10px] text-slate-400 block select-all break-all">{txHash}</span>
                    <p className="text-[10px] text-slate-500 mt-1">Redirecting you to dashboard shortly...</p>
                  </div>
                )}
              </div>

            </form>
          </GlassCard>
        </div>

        {/* Right Column: AI Preview Output */}
        <div className="anim-fade-up h-full lg:sticky lg:top-24">
          <div
            ref={previewRef}
            className="w-full glass rounded-xl border border-white/10 p-6 md:p-8 h-[50vh] lg:h-[65vh] overflow-y-auto font-sans flex flex-col"
            style={{ boxShadow: "inset 0 0 40px rgba(0,0,0,0.6)" }}
          >
            {generatedPitch ? (
              <div className="prose prose-invert max-w-none text-slate-300 select-text">
                {generatedPitch.split("\n").map((line, idx) => {
                  if (line.startsWith("# ")) {
                    return <h1 key={idx} className="text-3xl font-extrabold text-glow-purple tracking-tight border-b border-white/5 pb-4 mb-6">{line.replace("# ", "")}</h1>;
                  }
                  if (line.startsWith("## ")) {
                    return <h2 key={idx} className="text-xl font-bold text-white mt-8 mb-4 border-l-2 border-indigo-400 pl-3">{line.replace("## ", "")}</h2>;
                  }
                  if (line.startsWith("### ")) {
                    return <h3 key={idx} className="text-base font-bold text-indigo-400 mt-6 mb-2">{line.replace("### ", "")}</h3>;
                  }
                  if (line.startsWith("- ")) {
                    return <li key={idx} className="ml-4 list-disc text-sm mb-1">{line.replace("- ", "")}</li>;
                  }
                  return <p key={idx} className="text-sm leading-relaxed mb-4">{line}</p>;
                })}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-slate-500">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-slate-400 mb-1">No Pitch Generated</h4>
                <p className="text-xs text-slate-600 max-w-xs leading-relaxed">
                  Enter your Campaign Title, write down your concepts, and hit "Generate AI Pitch" to see your technical audit profile draft.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
