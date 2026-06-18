"use client";

import React from "react";
import { m } from "framer-motion";
import { useRouter } from "next/navigation";

export default function KeyboardWidget() {
  const router = useRouter();

  return (
    <section className="py-32 relative overflow-hidden flex flex-col items-center justify-center">
      {/* Background Gradient/Waves (Mimicking the image) */}
      <div className="absolute inset-0 z-0 bg-[#02020A]">
        {/* Radial gradients to simulate the wavy deep blue background */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-[#02020A] to-[#02020A]"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      </div>
      
      <m.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl w-full mx-auto px-4 sm:px-6 text-center z-10 flex flex-col items-center"
      >
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold font-heading text-white tracking-tight mb-6 leading-[1.1] max-w-3xl">
          Shortcut your team&apos;s <br className="hidden md:block"/>
          <span className="font-serif italic font-normal tracking-normal text-indigo-300">workflow</span>.
        </h2>
        
        <p className="text-indigo-200/70 text-base md:text-lg max-w-2xl mb-12 font-sans font-medium">
          Don&apos;t miss out on the opportunity to elevate your operations with our automated, trustless escrow solutions.
        </p>

        {/* The Pill Button from the Image */}
        <button 
          onClick={() => router.push("/create")}
          className="group relative flex items-center justify-between p-2 pl-8 bg-white rounded-full overflow-hidden hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_40px_rgba(99,102,241,0.2)] mb-10"
        >
          <span className="text-[#3B82F6] font-semibold text-lg mr-8 font-sans">
            Launch Protocol Console
          </span>
          <div className="w-12 h-12 rounded-full bg-[#3B82F6] flex items-center justify-center text-white shadow-md group-hover:bg-blue-600 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:translate-x-1 transition-transform">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>
        </button>

        {/* Retaining the original navigation actions below the button */}
        <div className="flex items-center gap-6 text-sm font-medium text-slate-400">
          <a 
            href="#explore" 
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Explore Active Campaigns
          </a>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
          <a 
            href="#faq" 
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Read FAQs
          </a>
        </div>
      </m.div>
    </section>
  );
}
