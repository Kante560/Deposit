"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { m } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

const TAB_DATA = [
  {
    title: "Milestone Setup",
    heading: "Define custom milestones & tranches",
    description: "Creators define explicit deliverables with percentage payout tranches (e.g. 30%, 30%, 40%) locked inside the smart escrow contract.",
    image: "/milestone1.jpg",
    imageCaption: "Milestone configuration active on Base L2",
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
    imageCaption: "Audit passed: Swarm node #409 verified",
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
    imageCaption: "L2 Base signature generated for payout",
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
    imageCaption: "Contributor refund claimed successfully",
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

export default function AutomationPlaybooks() {
  const [activeTab, setActiveTab] = useState(0);
  const playbooksRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!playbooksRef.current) return;
    gsap.fromTo(
      playbooksRef.current.querySelector(".tab-content-panel"),
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
    );
  }, [activeTab]);

  return (
    <section className="py-28 border-b border-white/5 bg-[#000000] overflow-hidden" ref={playbooksRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <m.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-widest block mb-3">
            Feature Deep Dive
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-white tracking-tight mb-4">
            Automation <span className="font-serif italic font-normal tracking-normal gradient-text-purple">Playbooks</span>
          </h2>
          <p className="text-slate-400 text-sm md:text-base font-sans">
            Secure crowdfunding campaigns with predictable milestone automation. Here is how it works under the hood:
          </p>
        </m.div>

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
            <div className="rounded-xl overflow-hidden shadow-2xl border border-white/10 relative group">
              <Image 
                key={activeTab} 
                src={TAB_DATA[activeTab].image} 
                alt={TAB_DATA[activeTab].title} 
                width={800}
                height={500}
                className="w-full h-auto object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" 
              />
              {/* Dark overlay from bottom-left */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/90 via-black/20 to-transparent pointer-events-none" />
              
              {/* Image Caption Write-up */}
              <div className="absolute bottom-6 left-6 right-6">
                <span className="px-3 py-1.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono text-slate-200 shadow-lg flex w-fit items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {TAB_DATA[activeTab].imageCaption}
                </span>
              </div>
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
      </div>
    </section>
  );
}
