"use client";

import React, { useState } from "react";
import { m } from "framer-motion";
import { useRouter } from "next/navigation";

export default function KeyboardWidget() {
  const router = useRouter();
  const [keyboardGlow, setKeyboardGlow] = useState<string | null>(null);

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
    <section className="py-28 bg-[#000000] relative overflow-hidden flex flex-col items-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <m.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-4xl w-full mx-auto px-4 sm:px-6 text-center z-10 flex flex-col items-center"
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
      </m.div>
    </section>
  );
}
