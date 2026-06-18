"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { m } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
  const outerRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const track = trackRef.current;
    const outer = outerRef.current;
    if (!track || !outer) return;

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const totalPanels = 4;
      const panelCount = totalPanels - 1; // = 3

      const getScrollAmount = () => {
        const track = trackRef.current;
        if (!track || track.children.length < 2) return 0;
        const p0 = track.children[0] as HTMLElement;
        const p1 = track.children[1] as HTMLElement;
        const distance = p1.offsetLeft - p0.offsetLeft;
        return distance * panelCount;
      };

      gsap.to(track, {
        x: () => -getScrollAmount(),
        ease: 'none',
        scrollTrigger: {
          trigger: outer,
          pin: true,
          pinSpacing: true,
          scrub: 1,
          end: () => '+=' + getScrollAmount(),
          invalidateOnRefresh: true,
          snap: {
            snapTo: 1 / panelCount,
            duration: { min: 0.3, max: 0.6 },
            ease: 'power2.inOut',
            delay: 0.05,
          },
        },
      });

      ScrollTrigger.refresh();

      return () => {
        ScrollTrigger.getAll().forEach(t => t.kill());
        ScrollTrigger.clearScrollMemory();
      };
    }
  }, []);

  return (
    <section 
      ref={outerRef} 
      className="hs-outer w-full h-[100vh] overflow-hidden bg-[#000000] relative border-b border-white/5"
    >
      <div className="absolute top-12 left-0 right-0 z-10 pointer-events-none px-4">
        <m.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center max-w-2xl mx-auto"
        >
          <span className="text-[10px] md:text-xs font-bold font-mono text-indigo-400 uppercase tracking-widest block mb-2 drop-shadow-md">
            Feature Deep Dive
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold font-heading text-white tracking-tight mb-3 drop-shadow-xl">
            Automation <span className="font-serif italic font-normal tracking-normal gradient-text-purple">Playbooks</span>
          </h2>
          <div className="inline-block px-4 py-2 rounded-xl bg-black/40 backdrop-blur-sm border border-white/5 shadow-lg">
            <p className="text-slate-300 text-xs md:text-sm font-sans max-w-lg mx-auto">
              Secure crowdfunding campaigns with predictable milestone automation. Here is how it works under the hood:
            </p>
          </div>
        </m.div>
      </div>

      <div 
        ref={trackRef} 
        className="hs-track flex h-full items-center will-change-transform w-max gap-8 lg:gap-16"
        style={{ paddingLeft: 'max(5vw, calc(50vw - 512px))', paddingRight: 'max(5vw, calc(50vw - 512px))' }}
      >
        {TAB_DATA.map((tab, idx) => (
          <div key={idx} className="hs-panel w-[90vw] max-w-5xl shrink-0 flex items-center justify-center pt-32 pb-12">
            <div className="w-full mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white/1 border border-white/5 rounded-xl p-6 lg:p-8 glass relative">
                <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
                
                <div className="lg:col-span-5 space-y-4 relative z-10">
                  <span className="text-[10px] md:text-xs font-bold font-mono text-[#a5b4fc] tracking-wider uppercase inline-flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Step 0{idx + 1}
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold font-heading text-white">
                    {tab.heading}
                  </h3>
                  <p className="text-slate-400 text-xs md:text-sm font-sans leading-relaxed">
                    {tab.description}
                  </p>
                  
                  <div className="pt-2">
                    <a 
                      href="#explore" 
                      className="btn-glass inline-flex items-center gap-2 text-xs py-2 px-4"
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

                <div className="lg:col-span-7 space-y-4 flex flex-col justify-center relative z-10">
                  <div className="rounded-xl overflow-hidden shadow-2xl border border-white/10 relative group h-[25vh] min-h-[160px]">
                    <Image 
                      src={tab.image} 
                      alt={tab.title} 
                      fill
                      className="object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" 
                    />
                    {/* Dark overlay from bottom-left */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/90 via-black/20 to-transparent pointer-events-none" />
                    
                    {/* Image Caption Write-up */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="px-2.5 py-1.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] md:text-xs font-mono text-slate-200 shadow-lg flex w-fit items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        {tab.imageCaption}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-[#050508] border border-white/10 p-4 shadow-2xl font-mono text-[10px] md:text-xs text-slate-300 relative overflow-hidden max-h-[25vh] overflow-y-auto">
                    <div className="sticky top-0 right-0 flex justify-end gap-1.5 mb-2 pb-1 bg-[#050508]/80 backdrop-blur z-10">
                      <span className="w-2 h-2 rounded-full bg-white/10" />
                      <span className="w-2 h-2 rounded-full bg-white/10" />
                      <span className="w-2 h-2 rounded-full bg-white/10" />
                    </div>
                    <pre className="whitespace-pre-wrap select-all">
                      {tab.code}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
