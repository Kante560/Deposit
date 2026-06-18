import React from "react";
import DotField from "@/components/ui/DotField";

export default function Footer() {
  return (
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


            {/* Right Column — Quick Links only */}
            <div className="md:col-span-7 flex justify-start md:justify-end">
              <div className="space-y-4 font-sans">
                <span className="text-white font-bold text-sm block tracking-wide uppercase font-mono">Quick Links</span>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li>
                    <a
                      href="#capabilities"
                      onClick={(e) => { e.preventDefault(); document.getElementById("capabilities")?.scrollIntoView({ behavior: "smooth" }); }}
                      className="hover:text-white transition-colors"
                    >
                      Features
                    </a>
                  </li>
                  <li>
                    <a
                      href="#explore"
                      onClick={(e) => { e.preventDefault(); document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" }); }}
                      className="hover:text-white transition-colors"
                    >
                      Explore Campaigns
                    </a>
                  </li>
                  <li>
                    <a href="/create" className="hover:text-white transition-colors">
                      Create Campaign
                    </a>
                  </li>
                  <li>
                    <a
                      href="#faq"
                      onClick={(e) => { e.preventDefault(); document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" }); }}
                      className="hover:text-white transition-colors"
                    >
                      FAQ
                    </a>
                  </li>
                  <li>
                    <a href="/explore" className="hover:text-white transition-colors">
                      All Campaigns
                    </a>
                  </li>
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
  );
}
