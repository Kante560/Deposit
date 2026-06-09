"use client";

import React, { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

gsap.registerPlugin(useGSAP);

interface OracleModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: number;
  originalPromise: string;
  onSuccess: () => void;
}

type ModalState = "input" | "loading" | "success" | "fail";

export default function OracleModal({
  isOpen,
  onClose,
  campaignId,
  originalPromise,
  onSuccess,
}: OracleModalProps) {
  const [evidenceLink, setEvidenceLink] = useState("");
  const [modalState, setModalState] = useState<ModalState>("input");
  const [txHash, setTxHash] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [errorDetails, setErrorDetails] = useState("");

  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP animation on open/close
  useGSAP(() => {
    if (isOpen) {
      gsap.to(overlayRef.current, {
        autoAlpha: 1,
        duration: 0.3,
        ease: "power2.out",
      });
      gsap.fromTo(
        containerRef.current,
        { scale: 0.9, y: 20 },
        { scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
      );
    } else {
      gsap.to(overlayRef.current, {
        autoAlpha: 0,
        duration: 0.2,
        ease: "power2.in",
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceLink.trim()) return;

    setModalState("loading");
    setFeedbackMsg("AI Oracle is fetching and analyzing the submitted evidence...");

    try {
      const response = await fetch("http://localhost:3002/api/verify-milestone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignId,
          originalPromise,
          evidenceLink,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // PASS
        setTxHash(data.transactionHash);
        setFeedbackMsg(data.reason);
        setModalState("success");
        onSuccess();
      } else {
        // FAIL or error
        setTxHash(data.transactionHash ?? "");
        setFeedbackMsg(data.reason ?? data.error ?? "Evidence rejected by the AI Oracle.");
        setErrorDetails(data.details ?? "");
        setModalState("fail");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setModalState("fail");
      setFeedbackMsg("Could not connect to the AI Oracle server. Make sure it is running on http://localhost:3002.");
    }
  };

  const handleClose = () => {
    // Reset state before closing
    setEvidenceLink("");
    setModalState("input");
    setTxHash("");
    setFeedbackMsg("");
    setErrorDetails("");
    onClose();
  };

  return (
    <div
      ref={overlayRef}
      className="modal-overlay opacity-0 invisible"
      style={{ willChange: "opacity, visibility" }}
    >
      <div
        ref={containerRef}
        className={`w-full max-w-lg rounded-2xl glass-elevated border p-8 flex flex-col relative overflow-hidden transition-colors duration-500 ${
          modalState === "success"
            ? "border-[#34D399] shadow-[0_0_50px_rgba(52,211,153,0.15)]"
            : modalState === "fail"
            ? "border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.1)]"
            : "border-white/10"
        }`}
      >
        {/* Subtle top decoration */}
        <div
          className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${
            modalState === "success"
              ? "from-emerald-500 to-teal-400"
              : modalState === "fail"
              ? "from-red-500 to-rose-400"
              : "from-indigo-500 to-purple-500"
          }`}
        />

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <span
              className={`text-xs font-bold uppercase tracking-widest font-mono ${
                modalState === "success"
                  ? "text-[#34D399]"
                  : modalState === "fail"
                  ? "text-red-400"
                  : "text-indigo-400"
              }`}
            >
              {modalState === "loading"
                ? "Autonomous Audit"
                : modalState === "success"
                ? "Milestone Verified"
                : modalState === "fail"
                ? "Audit Rejected"
                : "Submit Evidence"}
            </span>
            <h3 className="text-xl font-bold mt-1">Milestone #{campaignId} Oracle Audit</h3>
          </div>
          {modalState !== "loading" && (
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>

        {/* Body Content depending on state */}
        {modalState === "input" && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Milestone Promise
              </label>
              <div className="bg-white/5 border border-white/8 rounded-lg p-3 text-sm text-slate-300 font-sans italic">
                &quot;{originalPromise}&quot;
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Evidence URL (GitHub, UI Mockup, etc.)
              </label>
              <input
                type="url"
                required
                placeholder="https://github.com/org/repo/pull/1"
                value={evidenceLink}
                onChange={(e) => setEvidenceLink(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-400 transition-colors placeholder:text-slate-600"
              />
              <p className="text-xs text-slate-500 mt-2">
                The AI Oracle will inspect this URL to determine if the promise is fully implemented.
              </p>
            </div>

            <button type="submit" className="btn-primary w-full mt-2">
              Analyze Milestone
            </button>
          </form>
        )}

        {modalState === "loading" && (
          <div className="flex flex-col items-center justify-center py-8 text-center animate-pulse-glow">
            {/* Pulsing Oracle Core */}
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-6">
              <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="16"></circle>
              </svg>
            </div>
            <p className="text-base font-semibold text-indigo-400 mb-2">AI Oracle Analyzing Evidence...</p>
            <p className="text-sm text-slate-400 max-w-sm font-sans">{feedbackMsg}</p>
          </div>
        )}

        {modalState === "success" && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-[#34D399]">Audit Passed Successfully</p>
                <p className="text-xs text-slate-400">Milestone payout released on Base.</p>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Oracle Verdict
              </span>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">{feedbackMsg}</p>
            </div>

            {txHash && (
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Base Transaction Hash
                </span>
                <a
                  href={`#`}
                  onClick={(e) => e.preventDefault()} // Local network
                  className="font-mono text-xs text-indigo-400/80 hover:text-indigo-400 transition-colors break-all select-all block bg-white/5 border border-white/5 rounded p-2"
                >
                  {txHash}
                </a>
              </div>
            )}

            <button onClick={handleClose} className="btn-primary w-full mt-2">
              Done
            </button>
          </div>
        )}

        {modalState === "fail" && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-red-400">Audit Rejected By Oracle</p>
                <p className="text-xs text-slate-400">Milestone payout failed. Escrow locked.</p>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                AI Auditor Justification
              </span>
              <p className="text-sm text-red-300 bg-red-500/5 border border-red-500/10 rounded-lg p-3 leading-relaxed font-sans italic">
                &quot;{feedbackMsg}&quot;
              </p>
            </div>

            {txHash && (
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Base Transaction Hash
                </span>
                <a
                  href={`#`}
                  onClick={(e) => e.preventDefault()}
                  className="font-mono text-xs text-red-400/80 hover:text-red-400 transition-colors break-all select-all block bg-white/5 border border-white/5 rounded p-2"
                >
                  {txHash}
                </a>
              </div>
            )}

            {errorDetails && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded p-2 max-h-24 overflow-y-auto font-mono">
                {errorDetails}
              </div>
            )}

            <button onClick={handleClose} className="btn-primary w-full mt-2">
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
