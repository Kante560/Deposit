"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

gsap.registerPlugin(useGSAP);

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function GlassCard({ children, className = "", onClick }: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!cardRef.current) return;

    const el = cardRef.current;

    // Hover mouse enter/leave animations
    const onMouseEnter = () => {
      gsap.to(el, {
        y: -6,
        borderColor: "rgba(99, 102, 241, 0.35)", // subtle purple tint border
        boxShadow: "0 12px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(99, 102, 241, 0.08)",
        duration: 0.4,
        ease: "power2.out",
      });
    };

    const onMouseLeave = () => {
      gsap.to(el, {
        y: 0,
        borderColor: "rgba(255, 255, 255, 0.08)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
        duration: 0.4,
        ease: "power2.out",
      });
    };

    el.addEventListener("mouseenter", onMouseEnter);
    el.addEventListener("mouseleave", onMouseLeave);

    return () => {
      el.removeEventListener("mouseenter", onMouseEnter);
      el.removeEventListener("mouseleave", onMouseLeave);
    };
  }, { scope: cardRef });

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={`glass rounded-xl p-6 transition-all duration-300 relative overflow-hidden ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      style={{
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
        willChange: "transform, border-color, box-shadow",
      }}
    >
      {/* Subtle shine overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none opacity-50" />
      {children}
    </div>
  );
}
