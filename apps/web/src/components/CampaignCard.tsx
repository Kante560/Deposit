"use client";

import React from "react";
import Link from "next/link";
import GlassCard from "./GlassCard";
import { LazyMotion, domAnimation, m } from "framer-motion";

interface CampaignCardProps {
  id: number;
  title: string;
  description: string;
  creator: string;
  goal: string; // formatted e.g., "5.0 ETH"
  totalFunded: string; // formatted e.g., "2.5 ETH"
  percentFunded: number; // e.g. 50
  deadlineStr: string; // e.g. "5 days left"
  currentMilestone: number;
  totalMilestones: number;
  trustScore: number; // e.g. 96
  isFailed: boolean;
  isCompleted: boolean;
}

export default function CampaignCard({
  id,
  title,
  description,
  creator,
  goal,
  totalFunded,
  percentFunded,
  deadlineStr,
  currentMilestone,
  totalMilestones,
  trustScore,
  isFailed,
  isCompleted,
}: CampaignCardProps) {
  const truncatedCreator = `${creator.substring(0, 6)}...${creator.substring(creator.length - 4)}`;

  return (
    <LazyMotion features={domAnimation}>
      <Link href={`/campaign/${id}`} className="block">
        <GlassCard className="h-full flex flex-col justify-between">
          <div>
            {/* Top Row: Trust Badge & Status */}
            <div className="flex justify-between items-center mb-4">
              <div className="trust-badge">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1.5L2 4v4.5c0 3 2.5 5.5 6 6.5 3.5-1 6-4 6-6.5V4l-6-2.5z" fill="rgba(52, 211, 153, 0.1)" stroke="#34D399" strokeWidth="1.2" />
                  <path d="M5.5 8l1.5 1.5 3.5-3.5" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{trustScore}% Trust</span>
              </div>

              {isCompleted ? (
                <span className="text-xs font-bold uppercase tracking-wider text-[#34D399] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  Completed
                </span>
              ) : isFailed ? (
                <span className="text-xs font-bold uppercase tracking-wider text-red-400 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20">
                  Failed Audit
                </span>
              ) : (
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                  Active
                </span>
              )}
            </div>

            {/* Title & Description */}
            <h4 className="text-lg font-bold mb-2 group-hover:text-indigo-400 transition-colors line-clamp-1">
              {title}
            </h4>
            <p className="text-sm text-slate-400 mb-6 line-clamp-2 h-10 font-sans">
              {description}
            </p>
          </div>

          <div>
            {/* Progress Section */}
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-slate-400">Raised {totalFunded}</span>
              <span className="text-indigo-400">{percentFunded}%</span>
            </div>

            <div className="progress-track mb-5">
              <m.div
                className="progress-fill"
                initial={{ width: 0 }}
                whileInView={{ width: `${Math.min(percentFunded, 100)}%` }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>

            {/* Details footer */}
            <div className="flex justify-between items-center text-xs border-t border-white/5 pt-4 text-slate-400 font-mono">
              <div>
                <span className="block text-[10px] uppercase text-slate-500 tracking-wider">Creator</span>
                <span className="text-slate-300 font-medium">{truncatedCreator}</span>
              </div>
              <div className="text-center">
                <span className="block text-[10px] uppercase text-slate-500 tracking-wider">Milestones</span>
                <span className="text-slate-300 font-medium">{currentMilestone}/{totalMilestones}</span>
              </div>
              <div className="text-right">
                <span className="block text-[10px] uppercase text-slate-500 tracking-wider">Time</span>
                <span className="text-slate-300 font-medium">{deadlineStr}</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </Link>
    </LazyMotion>
  );
}
