"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useReadContract, useReadContracts, useChainId } from "wagmi";
import { formatEther } from "viem";
import { DepositEscrowABI, getContractAddress } from "@deposit/contracts";
import HeroSection from "@/components/HeroSection";
import CampaignCard from "@/components/CampaignCard";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import DotField from "@/components/ui/DotField";

gsap.registerPlugin(useGSAP);

// ─── Mock seed campaigns for design-rich visual presentation ───────────────
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

const FAQS = [
  {
    question: "How does the AI Oracle verify that a milestone has been completed?",
    answer: "The AI Oracle connects to secure external sources (like GitHub or Vercel) using read-only access. It checks commit history, pulls build status, runs automated tests, or hits API endpoints. If all checks pass, it cryptographically signs the release transaction."
  },
  {
    question: "What happens if a creator fails to meet their milestone deadline?",
    answer: "If the campaign deadline expires and milestones are incomplete, or if the project fails its verification checks, the campaign is flagged as failed. Contributors can immediately call the refund function to retrieve their remaining locked funds."
  },
  {
    question: "Are the funds locked on Base L2 secure?",
    answer: "Yes. All funds are held in the decentralized DepositEscrow smart contract. No person, including the Oracle, has direct access to the funds. Payouts can only be released to the creator or returned to contributors according to the immutable contract logic."
  },
  {
    question: "Can contributors dispute an Oracle decision?",
    answer: "The oracle is bound by automated verification rules. In case of conflicts, the contract can hold a dispute resolution window, allowing multi-signature fallback or democratic DAO vote weights to override."
  }
];

const TAB_DATA = [
  {
    title: "Milestone Setup",
    heading: "Define custom milestones & tranches",
    description: "Creators define explicit deliverables with percentage payout tranches (e.g. 30%, 30%, 40%) locked inside the smart escrow contract.",
    image: "/milestone1.jpg",
    code: `// Campaign Setup Properties
struct Campaign {
    address payable creator;
    uint256 goal;
    uint256 deadline;
    uint256 totalFunded;
    uint256 currentMilestone;
    uint256[] milestoneTranches; // e.g. [30, 30, 40]
    bool isFailed;
}`
  },
  {
    title: "AI Oracle Audits",
    heading: "Automated verification scans",
    description: "AI-Oracle monitors code repository events, deployment states, or test suite completions to run checks before signing milestone completions.",
    image: "/audit.jpg",
    code: `{
  "milestoneIndex": 1,
  "verificationSource": "github.com/deposit-protocol",
  "commitHash": "8f2c01d4aef88e02",
  "buildStatus": "SUCCESS",
  "testRun": "14/14 tests passed",
  "confidenceScore": 0.992
}`
  },
  {
    title: "Cryptographic Releases",
    heading: "Secured L2 transaction releases",
    description: "Once AI verification succeeds, the Oracle generates a cryptographic signature and triggers Base L2 smart contract payouts instantly.",
    image: "/cryto-release.jpg",
    code: `// Trigger instant payout on-chain
function approveMilestone(uint256 campaignId) external onlyOracle {
    Campaign storage c = campaigns[campaignId];
    uint256 payout = (c.goal * c.milestoneTranches[c.currentMilestone]) / 100;
    c.currentMilestone++;
    c.creator.transfer(payout);
}`
  },
  {
    title: "Refund Safeguard",
    heading: "Failsafes for failed deadlines & reviews",
    description: "If the project fails an audit or passes its deadline without delivering, contributors can withdraw their remaining locked funds immediately.",
    image: "/refund safegaurd.jpg",
    code: `// Failsafe refund mechanism
function claimRefund(uint256 campaignId) external nonReentrant {
    Campaign storage c = campaigns[campaignId];
    require(c.isFailed || block.timestamp > c.deadline);
    uint256 refundAmount = contributorBalances[campaignId][msg.sender];
    contributorBalances[campaignId][msg.sender] = 0;
    payable(msg.sender).transfer(refundAmount);
}`
  }
];

export default function Page() {
  const router = useRouter();
  const chainId = useChainId();
  const contractAddress = useMemo(() => getContractAddress(chainId), [chainId]);

  // States for landing page elements
  const [activeTab, setActiveTab] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [keyboardGlow, setKeyboardGlow] = useState<string | null>(null);
  
  // App readiness state for smooth initial load
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // Wait for fonts, Three.js, and initial rendering to settle
    const readyTimer = setTimeout(() => {
      setIsAppReady(true);
    }, 1200);
    return () => clearTimeout(readyTimer);
  }, []);

  // GSAP animation container refs
  const playbooksRef = useRef<HTMLDivElement>(null);

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

  // Tab switch animation
  useGSAP(() => {
    if (!playbooksRef.current) return;
    gsap.fromTo(
      playbooksRef.current.querySelector(".tab-content-panel"),
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
    );
  }, [activeTab]);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleKeyboardPress = (key: string, action: string) => {
    setKeyboardGlow(key);
    setTimeout(() => setKeyboardGlow(null), 300);

    if (action === "create") {
      router.push("/create");
    } else if (action === "explore") {
      document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
    } else if (action === "help") {
      document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* ─── Global Initial Loader Overlay ─── */}
      <AnimatePresence>
        {!isAppReady && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#000000] backdrop-blur-3xl"
          >
            {/* Minimal glowing spinner/logo area */}
            <div className="relative flex items-center justify-center mb-8">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="absolute inset-0 rounded-full border border-t-[#00c6d4] border-r-indigo-500 border-b-transparent border-l-transparent opacity-80"
                style={{ width: "80px", height: "80px", margin: "-16px" }}
              />
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.4)]">
                <span className="text-black font-black text-xl tracking-tighter">D</span>
              </div>
            </div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xs font-mono tracking-widest text-slate-400 uppercase"
            >
              Initializing Protocol...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col bg-[#000000] text-slate-200">
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. Trust Logos Bar */}
      <section className="py-12 border-y border-white/5 bg-[#000000] overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="max-w-5xl mx-auto px-6 text-center relative"
        >
          <p className="text-xs font-mono tracking-widest text-[#00c6d4] uppercase mb-8 opacity-80">
            Securing milestone agreements for builders on L2 networks
          </p>
          
          <div className="relative w-full flex items-center overflow-hidden">
            {/* Fade gradients for the marquee edges to give a shady feel */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#000000] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#000000] to-transparent z-10 pointer-events-none" />
            
            <div className="flex whitespace-nowrap animate-marquee opacity-50">
              {/* Duplicated list for seamless infinite scroll */}
              {[1, 2].map((key) => (
                <div key={key} className="flex gap-16 items-center px-8">
                  <span className="text-lg font-bold font-mono tracking-tight text-slate-300 flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1e3a8a]" /> BASE
                  </span>
                  <span className="text-lg font-bold font-mono tracking-tight text-slate-300 flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#7f1d1d]" /> OPTIMISM
                  </span>
                  <span className="text-lg font-bold font-mono tracking-tight text-slate-300 flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0d9488]" /> ARBITRUM
                  </span>
                  <span className="text-lg font-bold font-mono tracking-tight text-slate-300 flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#475569]" /> ZKSYNC
                  </span>
                  <span className="text-lg font-bold font-mono tracking-tight text-slate-300 flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#64748b]" /> ETHEREUM
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. Product Capabilities (Header & Grid) */}
      <section id="capabilities" className="py-28 border-b border-white/5 bg-[#000000]">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-7xl mx-auto px-6"
        >
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="px-3 py-1 rounded-full glass border border-indigo-500/20 bg-indigo-500/5 text-xs font-mono tracking-wider text-[#a5b4fc] inline-block mb-4">
              Protocol Capabilities
            </span>
            <h2 className="text-4xl md:text-6xl font-extrabold font-heading text-white tracking-tight mb-4">
              Powerful <span className="font-serif italic font-normal tracking-normal gradient-text-purple pr-2">features</span>, built-in.
            </h2>
            <p className="text-slate-400 text-base md:text-lg font-sans">
              Modern crowdfunding workflows that protect contributors and incentivize builders.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Card 1 (L: 7 cols) */}
            <div className="lg:col-span-7 rounded-xl glass border border-white/10 p-8 flex flex-col justify-between bg-white/2 hover:border-indigo-500/20 transition-all duration-300 shadow-xl relative group">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
              <div>
                <h3 className="text-2xl font-bold mb-3 text-white">Automated Milestone Escrows</h3>
                <p className="text-slate-400 text-sm md:text-base mb-6 font-sans">
                  Configure custom funding releases. Commit funds in locked escrow tranches that execute payouts only when predefined verification conditions are satisfied.
                </p>
                <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-6 mb-8">
                  <div>
                    <span className="block text-[10px] font-mono uppercase text-slate-500">Escrows locked</span>
                    <span className="text-xl font-bold font-heading text-white">$14.2M+</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-mono uppercase text-slate-500">Success rate</span>
                    <span className="text-xl font-bold font-heading text-emerald-400">98.4%</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-mono uppercase text-slate-500">Dispute resolution</span>
                    <span className="text-xl font-bold font-heading text-indigo-400">&lt; 24h</span>
                  </div>
                </div>
              </div>
              <div className="rounded-lg bg-black/50 border border-white/5 p-4 font-mono text-xs text-indigo-300/80 overflow-x-auto shadow-inner">
                <div className="flex justify-between items-center pb-2 mb-2 border-b border-white/5 text-[10px] text-slate-500">
                  <span>DepositEscrow.sol</span>
                  <span>Solidity v0.8.20</span>
                </div>
                <p className="text-slate-500">{"// Release milestone tranches securely"}</p>
                <p><span className="text-purple-400">function</span> approveMilestone(<span className="text-cyan-400">uint256</span> id) <span className="text-purple-400">external</span> onlyOracle &#123;</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;Campaign <span className="text-purple-400">storage</span> c = campaigns[id];</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-cyan-400">uint256</span> payout = (c.goal * c.milestoneTranches[c.currentMilestone]) / 100;</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;c.currentMilestone++;</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;c.creator.transfer(payout);</p>
                <p>&#125;</p>
              </div>
            </div>

            {/* Card 2 (R: 5 cols) */}
            <div className="lg:col-span-5 rounded-xl glass border border-white/10 p-8 flex flex-col justify-between bg-white/2 hover:border-indigo-500/20 transition-all duration-300 shadow-xl relative group">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />
              <div>
                <h3 className="text-2xl font-bold mb-3 text-white">AI Oracle Validation Feed</h3>
                <p className="text-slate-400 text-sm mb-6 font-sans">
                  The Decentralized AI Oracle Swarm monitors GitHub repositories, build pipelines, and production APIs to audit project status prior to signing payouts.
                </p>
              </div>

              <div className="space-y-3 font-mono text-[11px] bg-black/60 border border-white/5 rounded-lg p-5 shadow-inner">
                <div className="flex justify-between items-center text-[10px] text-slate-500 pb-2 border-b border-white/5 mb-1">
                  <span>ORACLE SWARM LOGS</span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    SYNCING
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-indigo-400">[04:47:11]</span>
                  <span className="text-slate-300">Swarm verification query initialized for Project #4</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-purple-400">[04:47:12]</span>
                  <span className="text-slate-400">Cloned GitHub repository commit branch main</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-cyan-400">[04:47:14]</span>
                  <span className="text-[#34D399] font-medium">✓ Audit check passed: Vercel server returns 200 OK</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-indigo-400">[04:47:15]</span>
                  <span className="text-slate-300">Generating cryptographic signature key (L2 Base)...</span>
                </div>
                <div className="flex gap-2 pt-2 border-t border-white/5">
                  <span className="text-emerald-400 font-bold">[SUCCESS]</span>
                  <span className="text-emerald-300 font-semibold">Tranche approved: Tx 0x4f82...7b1a</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 4. Enterprise Controls & Access Snapshot */}
      <section className="py-28 border-b border-white/5 bg-[#000000] relative">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-7xl mx-auto px-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Info List */}
            <div>
              <span className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-widest block mb-3">
                Decentralized Safeguards
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-white tracking-tight mb-6 leading-tight">
                Cryptographic <span className="font-serif italic font-normal tracking-normal gradient-text-purple pr-2">controls</span> built into every campaign.
              </h2>
              <p className="text-slate-400 text-sm md:text-base mb-10 font-sans leading-relaxed">
                No third-party accounts, no manual delays, no custodial risks. Deposit operates directly through audits signed by an automated Oracle running on Base Sepolia and Base Mainnet.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Multi-signature Oracle verification hooks",
                  "Tamper-resistant audit proof generation, 12 month history",
                  "Privileged DAO dispute and override safety mechanisms",
                  "Automated smart contract state machines for tranches"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-slate-300 font-sans text-sm">
                    <svg className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Card: Access Snapshot */}
            <div className="rounded-xl glass border border-white/10 p-8 bg-white/2 hover:border-indigo-500/20 transition-all duration-300 relative shadow-2xl">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="font-bold text-white text-lg">Escrow Security Snapshot</h4>
                  <p className="text-xs text-slate-500 font-mono">Updated 1 minute ago</p>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 font-mono">
                  Grade A+
                </span>
              </div>

              <div className="space-y-5">
                {[
                  { label: "Oracle Consensus Accuracy", value: "99.4%" },
                  { label: "Automated Build Scans", value: "100%" },
                  { label: "On-Chain Multi-Sig Security", value: "99.9%" },
                  { label: "Dispute Failsafe Coverage", value: "100%" }
                ].map((stat, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-medium font-mono text-slate-400">
                      <span>{stat.label}</span>
                      <span className="text-white font-bold">{stat.value}</span>
                    </div>
                    <div className="h-2 rounded bg-white/5 overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded" 
                        initial={{ width: 0 }}
                        whileInView={{ width: stat.value }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.15 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 5. Automation Playbooks (Tabbed Section) */}
      <section className="py-28 border-b border-white/5 bg-[#000000]" ref={playbooksRef}>
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-7xl mx-auto px-6"
        >
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-widest block mb-3">
              Feature Deep Dive
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-white tracking-tight mb-4">
              Automation <span className="font-serif italic font-normal tracking-normal gradient-text-purple">Playbooks</span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base font-sans">
              Secure crowdfunding campaigns with predictable milestone automation. Here is how it works under the hood:
            </p>
          </div>

          {/* Tabs header row */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12 max-w-4xl mx-auto p-1.5 rounded-xl bg-white/2 border border-white/5 glass">
            {TAB_DATA.map((tab, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`px-5 py-2.5 rounded-lg text-xs font-mono font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === idx
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.title}
              </button>
            ))}
          </div>

          {/* Active Tab Panel */}
          <div className="tab-content-panel grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-white/1 border border-white/5 rounded-xl p-8 lg:p-12 glass relative">
            <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold font-mono text-[#a5b4fc] tracking-wider uppercase">
                Step 0{activeTab + 1}
              </span>
              <h3 className="text-2xl md:text-3xl font-bold font-heading text-white">
                {TAB_DATA[activeTab].heading}
              </h3>
              <p className="text-slate-400 text-sm md:text-base font-sans leading-relaxed">
                {TAB_DATA[activeTab].description}
              </p>
              
              <div className="pt-4">
                <a 
                  href="#explore" 
                  className="btn-glass inline-flex items-center gap-2"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  See Live Campaigns
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </a>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-xl overflow-hidden shadow-2xl border border-white/10 relative">
                <img key={activeTab} src={TAB_DATA[activeTab].image} alt={TAB_DATA[activeTab].title} className="w-full h-auto object-cover opacity-80 hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              </div>
              <div className="rounded-lg bg-[#050508] border border-white/10 p-6 shadow-2xl font-mono text-xs text-slate-300 relative overflow-hidden">
                <div className="absolute top-2 right-4 flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap select-all">
                  {TAB_DATA[activeTab].code}
                </pre>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 6. Campaign Grid Section (Explore verified campaigns) */}
      <section id="explore" className="py-28 border-b border-white/5 bg-[#000000]">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-7xl mx-auto px-6"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <span className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-widest block mb-2">
                Active Escrow Channels
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-white tracking-tight">
                Verified <span className="font-serif italic font-normal tracking-normal gradient-text-purple">Escrows</span>
              </h2>
              <p className="text-slate-400 text-sm md:text-base mt-2 max-w-xl font-sans">
                Review verified proposals. Smart contracts enforce that funds are released on milestone completion.
              </p>
            </div>
            
            <div className="mt-6 md:mt-0 flex gap-4 text-xs font-mono font-medium text-slate-400">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>On-Chain Sync</span>
              </div>
            </div>
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
        </motion.div>
      </section>

      {/* 7. Escrow Fees & Scale Tiers Grid (Pricing) */}
      <section className="py-28 border-b border-white/5 bg-[#000000]">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-7xl mx-auto px-6"
        >
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-widest block mb-3">
              Pricing Models
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-white tracking-tight mb-4">
              Simple, <span className="font-serif italic font-normal tracking-normal gradient-text-purple pr-1">predictable</span> fees.
            </h2>
            <p className="text-slate-400 text-sm md:text-base font-sans">
              No subscription charges. Only flat smart contract success fees upon approved milestone payouts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Hobby Tier */}
            <div className="rounded-xl glass border border-white/10 p-8 flex flex-col justify-between bg-white/2 hover:border-indigo-500/20 transition-all duration-300 relative group">
              <div>
                <span className="text-xs font-mono font-semibold text-slate-400 block mb-1">Hobby / Individual</span>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-extrabold font-heading text-white">0%</span>
                  <span className="text-slate-500 text-xs font-mono">fee per payout</span>
                </div>
                <p className="text-slate-400 text-xs mb-8 font-sans">
                  Best for individual developers testing campaigns locally or raising small community projects.
                </p>
                <ul className="space-y-3 mb-8 border-t border-white/5 pt-6 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    1 Active Campaign Channel
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Up to 2.0 ETH crowdfunding goal
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    AI Oracle auto-verification checks
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    3 Custom milestones support
                  </li>
                </ul>
              </div>
              <button 
                onClick={() => window.location.href = "/create"}
                className="btn-glass w-full text-center cursor-pointer"
              >
                Launch Free
              </button>
            </div>

            {/* Launchpad Tier */}
            <div className="rounded-xl glass border border-indigo-500/30 p-8 flex flex-col justify-between bg-white/2 hover:border-indigo-500/50 transition-all duration-300 relative group shadow-2xl">
              <div className="absolute top-0 right-4 -translate-y-1/2 px-2.5 py-0.5 rounded-full bg-indigo-500 text-white font-mono text-[9px] font-bold tracking-wider uppercase">
                Recommended
              </div>
              <div>
                <span className="text-xs font-mono font-semibold text-indigo-300 block mb-1">Launchpad / Project</span>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-extrabold font-heading text-white">0.5%</span>
                  <span className="text-slate-500 text-xs font-mono">fee per payout</span>
                </div>
                <p className="text-slate-400 text-xs mb-8 font-sans">
                  Designed for growing team protocols, decentralized communities, and serious funding goals.
                </p>
                <ul className="space-y-3 mb-8 border-t border-white/5 pt-6 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Unlimited Campaign Channels
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Up to 50.0 ETH goal parameters
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Custom AI Oracle validation criteria
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Up to 10 milestone tranches
                  </li>
                </ul>
              </div>
              <button 
                onClick={() => window.location.href = "/create"}
                className="btn-primary w-full text-center cursor-pointer shadow-lg shadow-indigo-500/10"
              >
                Create Campaign
              </button>
            </div>

            {/* Enterprise Tier */}
            <div className="rounded-xl glass border border-white/10 p-8 flex flex-col justify-between bg-white/2 hover:border-indigo-500/20 transition-all duration-300 relative group">
              <div>
                <span className="text-xs font-mono font-semibold text-slate-400 block mb-1">Enterprise / DAO</span>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-extrabold font-heading text-white">Custom</span>
                  <span className="text-slate-500 text-xs font-mono">payout models</span>
                </div>
                <p className="text-slate-400 text-xs mb-8 font-sans">
                  Engineered for DAO governance foundations, grant providers, and private token contracts.
                </p>
                <ul className="space-y-3 mb-8 border-t border-white/5 pt-6 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Custom Multi-Sig Oracle approvals
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Unlimited escrow budgets
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Private cloud AI Oracle nodes
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    SLA response guarantees & support
                  </li>
                </ul>
              </div>
              <a 
                href="mailto:support@deposit-protocol.xyz" 
                className="btn-glass w-full text-center cursor-pointer"
              >
                Contact Protocol Swarm
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 8. FAQs Section */}
      <section id="faq" className="py-28 border-b border-white/5 bg-[#000000]">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-4xl mx-auto px-6"
        >
          <div className="text-center mb-16">
            <span className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-widest block mb-3">
              FAQ
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-white tracking-tight mb-4">
              Common <span className="font-serif italic font-normal tracking-normal gradient-text-purple">questions</span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base font-sans">
              Learn how Deposit integrates automated AI validators with trustless smart contracts.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div 
                  key={i} 
                  className="rounded-lg border border-white/5 bg-white/1 overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(i)}
                    className="w-full text-left p-5 flex items-center justify-between font-semibold font-heading text-slate-200 hover:text-white cursor-pointer select-none text-sm md:text-base"
                  >
                    <span>{faq.question}</span>
                    <svg
                      className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isOpen ? "rotate-45 text-white" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                  
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? "max-h-48 border-t border-white/5 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="p-5 text-xs md:text-sm text-slate-400 font-sans leading-relaxed bg-black/40">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* 9. Neon Keyboard Widget & CTA */}
      <section className="py-28 bg-[#000000] relative overflow-hidden flex flex-col items-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-4xl mx-auto px-6 text-center z-10 flex flex-col items-center"
        >
          <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-white tracking-tight mb-4">
            Shortcut your team&apos;s <span className="font-serif italic font-normal tracking-normal gradient-text-purple">workflow</span>.
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mb-12 font-sans">
            Use keys below to navigate around the protocol console instantly.
          </p>

          {/* Interactive Keyboard Widget */}
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5 mb-16 p-6 rounded-2xl bg-white/2 border border-white/10 glass max-w-2xl">
            {[
              { key: "C", action: "create", label: "Create Escrow" },
              { key: "E", action: "explore", label: "Explore Grid" },
              { key: "H", action: "help", label: "Read FAQs" }
            ].map((btn) => (
              <button
                key={btn.key}
                onClick={() => handleKeyboardPress(btn.key, btn.action)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border font-mono select-none cursor-pointer transition-all duration-200 ${
                  keyboardGlow === btn.key
                    ? "bg-indigo-500 border-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.6)] scale-95"
                    : "bg-[#09090d] border-white/10 text-slate-300 hover:border-indigo-500/30 hover:shadow-[0_0_10px_rgba(99,102,241,0.1)]"
                }`}
                style={{ minWidth: "120px" }}
              >
                <span className="text-lg font-bold block mb-1 font-mono">{btn.key}</span>
                <span className="text-[10px] text-slate-500 font-sans tracking-wide">{btn.label}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <button 
              onClick={() => window.location.href = "/create"}
              className="btn-primary shadow-[0_0_30px_rgba(99,102,241,0.25)] cursor-pointer"
            >
              Launch Escrow Project
            </button>
            <a 
              href="#explore"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="btn-glass cursor-pointer"
            >
              Explore Active Campaigns
            </a>
          </div>
        </motion.div>
      </section>

      {/* 10. Footer */}
      <footer className="bg-[#000000] pb-12 pt-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#050508] border border-white/5 rounded-[2rem] p-8 md:p-16 relative overflow-hidden">
            {/* Background dotted pattern */}
            <div 
              className="absolute inset-0 z-0 opacity-40"
              style={{
                maskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)'
              }}
            >
              <DotField
                dotRadius={1.5}
                dotSpacing={14}
                bulgeStrength={67}
                glowRadius={160}
                sparkle={true}
                waveAmplitude={0}
                gradientFrom="#6366f1"
                gradientTo="#4a5cff"
                glowColor="rgba(99, 102, 241, 0.4)"
              />
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-12 mb-20 md:mb-32">
              {/* Left Column (Brand) */}
              <div className="md:col-span-5 space-y-6">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #6366f1 0%, #4a5cff 100%)" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 1L14 5V11L8 15L2 11V5L8 1Z" fill="#000000" strokeWidth="0" />
                      <path d="M8 5v6M5 6.5l3-1.5 3 1.5" stroke="#6366f1" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold tracking-tight text-white font-heading">
                    Deposit
                  </span>
                </div>
                <p className="text-slate-400 font-sans text-sm leading-relaxed max-w-sm">
                  The easiest way to automate crypto milestone actions using AI and natural language.
                </p>
                <p className="text-slate-500 font-sans text-xs">
                  Pronounced &quot;Deposit.&quot;
                </p>
              </div>

              {/* Right Column (Links) */}
              <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-8">
                {/* Product */}
                <div className="space-y-4 font-sans">
                  <span className="text-white font-bold text-sm block">Product</span>
                  <ul className="space-y-3 text-sm text-slate-400">
                    <li><a href="#" className="hover:text-white transition-colors">How it works</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Use cases</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                  </ul>
                </div>
                {/* Resources */}
                <div className="space-y-4 font-sans">
                  <span className="text-white font-bold text-sm block">Resources</span>
                  <ul className="space-y-3 text-sm text-slate-400">
                    <li><a href="#" className="hover:text-white transition-colors">Docs</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Guides</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                  </ul>
                </div>
                {/* Company */}
                <div className="space-y-4 font-sans">
                  <span className="text-white font-bold text-sm block">Company</span>
                  <ul className="space-y-3 text-sm text-slate-400">
                    <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                  </ul>
                </div>
                {/* Legal */}
                <div className="space-y-4 font-sans">
                  <span className="text-white font-bold text-sm block">Legal</span>
                  <ul className="space-y-3 text-sm text-slate-400">
                    <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Risk notice</a></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Giant Logo Text Bottom */}
            <div className="relative z-10 w-full flex justify-center items-center mt-12 overflow-hidden h-[100px] md:h-[180px]">
              <div className="flex items-center justify-center w-full gap-4 md:gap-8 translate-y-6 md:translate-y-10">
                <div
                  className="w-16 h-16 md:w-32 md:h-32 rounded-[1rem] md:rounded-[2rem] flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, #6366f1 0%, #4a5cff 100%)" }}
                >
                  <svg width="50%" height="50%" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1L14 5V11L8 15L2 11V5L8 1Z" fill="#000000" strokeWidth="0" />
                    <path d="M8 5v6M5 6.5l3-1.5 3 1.5" stroke="#050508" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </div>
                <h1 className="text-[5rem] md:text-[11rem] font-serif italic text-slate-200 tracking-tight leading-none m-0 p-0 pr-4">
                  Deposit
                </h1>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
