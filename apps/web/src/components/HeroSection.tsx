"use client";

import React, { useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

const AnoAI = dynamic(() => import("./ui/animated-shader-background"), { ssr: false });
const CyberHUD = dynamic(() => import("./CyberHUD"), { ssr: false });
import DotField from "./ui/DotField";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

gsap.registerPlugin(useGSAP);

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const ctaRowRef = useRef<HTMLDivElement>(null);

  // GSAP Entrance Animations
  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from(labelRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
    })
      .from(headlineRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power4.out",
      }, "-=0.3")
      .from(ctaRowRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      }, "-=0.4");
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[85vh] flex items-center overflow-hidden bg-[#000000] pt-28 pb-16 lg:py-20"
    >
      {/* 1. Background Shader Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden bg-[#000000]">
        {/* <AnoAI /> */}
        {/* Subtle glass texture overlay for tech depth */}
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
      </div>

      {/* 2. Hero Content (z-20) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column (Content Structure) */}
          <div className="flex flex-col justify-center items-start gap-8 select-none">
            
            {/* Headline Block */}
            <div ref={headlineRef} className="block">
              <h1
                className="font-sans font-medium leading-[1.08] tracking-[-0.03em] text-white"
                style={{
                  fontSize: "clamp(2rem, 5.5vw, 4.2rem)",
                }}
              >
                Fund Milestones. <br />
                <span className="font-serif italic font-normal tracking-normal gradient-text-purple pr-1">Release</span> Safely.
              </h1>
            </div>

            {/* Subheadline Block */}
            <div className="block max-w-lg">
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-sans">
                Secure your crowdfunding campaign with automated milestone protection. Deposit channels release funds only when verified by our decentralized AI oracle swarm.
              </p>
            </div>

            {/* Social Proof Container */}
            <div className="flex flex-col gap-4 w-full">
              <span ref={labelRef} className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                Securing milestone channels for builders on
              </span>
              <div className="flex flex-row items-center gap-6 flex-wrap opacity-60">
                <span className="text-xs font-bold font-mono tracking-tight text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  BASE
                </span>
                <span className="text-xs font-bold font-mono tracking-tight text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  OPTIMISM
                </span>
                <span className="text-xs font-bold font-mono tracking-tight text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  ARBITRUM
                </span>
              </div>
            </div>

            {/* CTA Container */}
            <div 
              ref={ctaRowRef}
              className="flex flex-row items-center gap-6 flex-wrap"
            >
              {/* Primary button with Hover Text Roll */}
              <button 
                onClick={() => window.location.href = "/create"}
                className="group flex items-center gap-3 bg-gradient-to-r from-[#6366f1] to-[#4a5cff] hover:shadow-lg hover:shadow-indigo-500/20 text-white text-[13px] sm:text-[14px] font-medium rounded-full pl-5 sm:pl-6 pr-2 py-2 cursor-pointer transition-all duration-300"
              >
                <div className="h-[20px] overflow-hidden">
                  <div className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-[20px]">
                    <span className="h-[20px] flex items-center">Launch Campaign</span>
                    <span className="h-[20px] flex items-center">Launch Campaign</span>
                  </div>
                </div>
                
                
                {/* White circle with Dark Arrow */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-gray-900 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:rotate-45">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              </button>

              {/* Partner badge */}
              <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-[4px] transition-all duration-300">
                {/* Compass / Starburst icon */}
                <svg 
                  className="w-5 h-5 sm:w-6 sm:h-6 fill-current text-indigo-400" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                </svg>
                <span className="text-[13px] sm:text-[14px] font-sans font-medium text-gray-200">
                  Certified Partner
                </span>
                
                {/* Featured mini-badge */}
                <span className="text-[10px] sm:text-[11px] font-sans font-bold bg-[#6366f1] text-white px-1.5 sm:px-2 py-0.5 rounded leading-none">
                  Featured
                </span>
              </div>

            </div>

          </div>

          {/* Right Column (Media Structure) */}
          <div className="flex justify-center lg:justify-end items-center relative w-full h-full">
            {/* Background gradient glow behind image */}
            <div className="absolute w-[80%] h-[80%] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="w-full max-w-lg aspect-[537/322] relative">
              <div className="relative w-full h-full flex items-center justify-center">
                {/* 3D Animation: Hidden on mobile, visible on lg screens */}
                <div className="w-full h-full hidden lg:flex items-center justify-center">
                  <Image 
                    src="/ZogTu1.png" 
                    alt="Deposit Hero" 
                    width={800}
                    height={600}
                    className="w-full h-auto max-h-full object-contain rounded-xl shadow-2xl " 
                    priority
                  />
                  {/* <CyberHUD /> */}
                </div>
                {/* Static Image: Visible on mobile, hidden on lg screens */}
                <div className="w-full h-full flex lg:hidden items-center justify-center p-2">
                  <Image 
                    src="/oracle2.png" 
                    alt="Deposit Hero" 
                    width={800}
                    height={600}
                    className="w-full h-auto max-h-full object-contain rounded-xl shadow-2xl border border-white/10" 
                    priority
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
