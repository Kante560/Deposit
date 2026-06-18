"use client";

import React, { useState } from "react";
import { m } from "framer-motion";

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

export default function FAQSection() {
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set(FAQS.map((_, i) => i)));

  const toggleFaq = (index: number) => {
    const next = new Set(openFaqs);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setOpenFaqs(next);
  };

  return (
    <section id="faq" className="py-32 border-b border-white/5 bg-[#000000] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          
          {/* Left Column (Sticky) */}
          <div className="lg:col-span-5 relative h-full">
            <m.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="sticky top-32"
            >
              <div className="font-heading font-extrabold text-xl tracking-tight text-white flex items-center gap-2 mb-10">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white">
                    <path d="M12 19V5M5 12l7-7 7 7"/>
                  </svg>
                </div>
                Deposit
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-heading text-white tracking-tight mb-6 leading-[1.1]">
                <span className="font-serif italic font-normal tracking-normal gradient-text-purple">FAQs</span>
              </h2>
              
              <p className="text-slate-400 text-sm md:text-base font-sans max-w-sm mb-10 leading-relaxed">
                Learn how Deposit integrates automated AI validators with trustless smart contracts to secure your milestones.
              </p>

              <button className="
                relative px-6 py-3
                rounded-lg
                bg-gradient-to-r from-indigo-500 to-violet-600
                text-white font-medium text-sm
                hover:from-indigo-400 hover:to-violet-500
                active:scale-[0.98]
                transition-all duration-150
                shadow-lg shadow-indigo-500/25
              ">
                Launch App
              </button>
            </m.div>
          </div>

          {/* Right Column (FAQ Items) */}
          <div className="lg:col-span-7 space-y-4">
            {FAQS.map((faq, i) => {
              const isOpen = openFaqs.has(i);
              return (
                <m.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                  key={i} 
                  className="rounded-xl border border-white/5 bg-white/4 backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-white/16"
                >
                  <button
                    onClick={() => toggleFaq(i)}
                    className="w-full text-left p-6 md:p-8 flex items-center justify-between font-semibold font-heading text-slate-200 hover:text-white cursor-pointer select-none text-base md:text-lg"
                  >
                    <span className="pr-8">{faq.question}</span>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                      <svg
                        className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-45 text-white" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </div>
                  </button>
                  
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? "max-h-64 border-t border-white/5 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="p-6 md:p-8 pt-4 md:pt-6 text-sm md:text-base text-slate-400 font-sans leading-relaxed bg-black/20">
                      {faq.answer}
                    </div>
                  </div>
                </m.div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
