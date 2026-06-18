import { m } from "framer-motion";

export default function ProductCapabilities() {
  return (
    <section id="capabilities" className="py-28 border-b border-white/5 bg-[#000000] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <m.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <span className="px-3 py-1 rounded-full glass border border-indigo-500/20 bg-indigo-500/5 text-xs font-mono tracking-wider text-[#a5b4fc] inline-block mb-4">
            Protocol Capabilities
          </span>
          <h2 className="text-4xl md:text-6xl font-extrabold font-heading text-white tracking-tight mb-4">
            Powerful <span className="font-serif italic font-normal tracking-normal gradient-text-purple pr-2">features</span>, built-in.
          </h2>
          <p className="text-slate-400 text-base md:text-lg font-sans">
            Modern crowdfunding workflows that protect contributors and incentivize builders.
          </p>
        </m.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <m.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-7 rounded-xl glass border border-white/10 p-8 flex flex-col justify-between bg-white/2 hover:border-indigo-500/20 transition-all duration-300 shadow-xl relative group"
          >
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
            <div>
              <h3 className="text-2xl font-bold mb-3 text-white">Automated Milestone Escrows</h3>
              <p className="text-slate-400 text-sm md:text-base mb-6 font-sans">
                Configure custom funding releases. Commit funds in locked escrow tranches that execute payouts only when predefined verification conditions are satisfied.
              </p>
              <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-6 mb-8">
                <div>
                  <span className="block text-[10px] font-mono uppercase text-slate-500">Escrows locked</span>
                  <span className="text-xl font-bold font-heading text-white">$14.2M+</span>
                </div>
                <div>
                  <span className="block text-[10px] font-mono uppercase text-slate-500">Success rate</span>
                  <span className="text-xl font-bold font-heading text-emerald-400">98.4%</span>
                </div>
                <div>
                  <span className="block text-[10px] font-mono uppercase text-slate-500">Dispute resolution</span>
                  <span className="text-xl font-bold font-heading text-indigo-400">&lt; 24h</span>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-black/50 border border-white/5 p-4 font-mono text-xs text-indigo-300/80 overflow-x-auto shadow-inner">
              <div className="flex justify-between items-center pb-2 mb-2 border-b border-white/5 text-[10px] text-slate-500">
                <span>DepositEscrow.sol</span>
                <span>Solidity v0.8.20</span>
              </div>
              <p className="text-slate-500">{"// Release milestone tranches securely"}</p>
              <p><span className="text-purple-400">function</span> approveMilestone(<span className="text-cyan-400">uint256</span> id) <span className="text-purple-400">external</span> onlyOracle &#123;</p>
              <p>&nbsp;&nbsp;&nbsp;&nbsp;Campaign <span className="text-purple-400">storage</span> c = campaigns[id];</p>
              <p>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-cyan-400">uint256</span> payout = (c.goal * c.milestoneTranches[c.currentMilestone]) / 100;</p>
              <p>&nbsp;&nbsp;&nbsp;&nbsp;c.currentMilestone++;</p>
              <p>&nbsp;&nbsp;&nbsp;&nbsp;c.creator.transfer(payout);</p>
              <p>&#125;</p>
            </div>
          </m.div>

          <m.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            className="lg:col-span-5 rounded-xl glass border border-white/10 p-8 flex flex-col justify-between bg-white/2 hover:border-indigo-500/20 transition-all duration-300 shadow-xl relative group"
          >
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />
            <div>
              <h3 className="text-2xl font-bold mb-3 text-white">AI Oracle Validation Feed</h3>
              <p className="text-slate-400 text-sm mb-6 font-sans">
                The Decentralized AI Oracle Swarm monitors GitHub repositories, build pipelines, and production APIs to audit project status prior to signing payouts.
              </p>
            </div>

            <div className="space-y-3 font-mono text-[11px] bg-black/60 border border-white/5 rounded-lg p-5 shadow-inner">
              <div className="flex justify-between items-center text-[10px] text-slate-500 pb-2 border-b border-white/5 mb-1">
                <span>ORACLE SWARM LOGS</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  SYNCING
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-indigo-400">[04:47:11]</span>
                <span className="text-slate-300">Swarm verification query initialized for Project #4</span>
              </div>
              <div className="flex gap-2">
                <span className="text-purple-400">[04:47:12]</span>
                <span className="text-slate-400">Cloned GitHub repository commit branch main</span>
              </div>
              <div className="flex gap-2">
                <span className="text-cyan-400">[04:47:14]</span>
                <span className="text-[#34D399] font-medium">✓ Audit check passed: Vercel server returns 200 OK</span>
              </div>
              <div className="flex gap-2">
                <span className="text-indigo-400">[04:47:15]</span>
                <span className="text-slate-300">Generating cryptographic signature key (L2 Base)...</span>
              </div>
              <div className="flex gap-2 pt-2 border-t border-white/5">
                <span className="text-emerald-400 font-bold">[SUCCESS]</span>
                <span className="text-emerald-300 font-semibold">Tranche approved: Tx 0x4f82...7b1a</span>
              </div>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
}
