import type { Metadata } from "next";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";
import Web3Provider from "@/components/Web3Provider";
import Navbar from "@/components/Navbar";

import NetworkGuard from "@/components/NetworkGuard";

export const metadata: Metadata = {
  title: "Deposit — AI-Verified Crowd Escrow",
  description: "Milestone-based crowdfunding verified by AI Oracle.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-obsidian text-slate-100 font-sans flex flex-col">
        <Web3Provider>
          <NetworkGuard>
            <Navbar />
            <main className="flex-1 flex flex-col">
              {children}
            </main>
          </NetworkGuard>
        </Web3Provider>
      </body>
    </html>
  );
}

