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
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section id="faq" className="py-28 border-b border-white/5 bg-[#000000] overflow-hidden">
      <m.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="max-w-4xl mx-auto px-4 sm:px-6"
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
      </m.div>
    </section>
  );
}
