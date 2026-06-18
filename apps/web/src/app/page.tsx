"use client";

import React, { useState, useEffect } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import TrustLogos from "@/components/TrustLogos";
import ProductCapabilities from "@/components/ProductCapabilities";
import EnterpriseControls from "@/components/EnterpriseControls";
import AutomationPlaybooks from "@/components/AutomationPlaybooks";
import ExploreCampaigns from "@/components/ExploreCampaigns";
import PricingModels from "@/components/PricingModels";
import FAQSection from "@/components/FAQSection";
import KeyboardWidget from "@/components/KeyboardWidget";
import Footer from "@/components/Footer";

export default function Page() {
  // App readiness state for smooth initial load
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // Wait for fonts, Three.js, and initial rendering to settle
    const readyTimer = setTimeout(() => {
      setIsAppReady(true);
    }, 1200);
    return () => clearTimeout(readyTimer);
  }, []);

  return (
    <LazyMotion features={domAnimation}>
      {/* ─── Global Initial Loader Overlay ─── */}
      <AnimatePresence>
        {!isAppReady && (
          <m.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#000000] backdrop-blur-3xl"
          >
            {/* Minimal glowing spinner/logo area */}
            <div className="relative flex items-center justify-center mb-8">
              <m.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="absolute inset-0 rounded-full border border-t-[#00c6d4] border-r-indigo-500 border-b-transparent border-l-transparent opacity-80"
                style={{ width: "80px", height: "80px", margin: "-16px" }}
              />
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.4)]">
                <span className="text-black font-black text-xl tracking-tighter">D</span>
              </div>
            </div>
            <m.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xs font-mono tracking-widest text-slate-400 uppercase"
            >
              Initializing Protocol...
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Root page wrapper — overflow-x-hidden prevents any child from causing horizontal scroll */}
      <div className="flex-1 flex flex-col bg-[#000000] text-slate-200 overflow-x-hidden w-full">
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. Trust Logos Bar */}
        <TrustLogos />

        {/* 3. Product Capabilities (Header & Grid) */}
        <ProductCapabilities />

        {/* 4. Enterprise Controls & Access Snapshot */}
        <EnterpriseControls />

        {/* 5. Automation Playbooks (Tabbed Section) */}
        <AutomationPlaybooks />

        {/* 6. Campaign Grid Section (Explore verified campaigns) */}
        <ExploreCampaigns />

        {/* 7. Escrow Fees & Scale Tiers Grid (Pricing) */}
        <PricingModels />

        {/* 8. FAQs Section */}
        <FAQSection />

        {/* 9. Neon Keyboard Widget & CTA */}
        <KeyboardWidget />

        {/* 10. Footer */}
        <Footer />
      </div>
    </LazyMotion>
  );
}
