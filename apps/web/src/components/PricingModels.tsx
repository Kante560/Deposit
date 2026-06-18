import { m } from "framer-motion";

export default function PricingModels() {
  return (
    <section className="py-28 border-b border-white/5 bg-[#000000] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <m.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <span className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-widest block mb-3">
            Pricing Models
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-white tracking-tight mb-4">
            Simple, <span className="font-serif italic font-normal tracking-normal gradient-text-purple pr-1">predictable</span> fees.
          </h2>
          <p className="text-slate-400 text-sm md:text-base font-sans">
            No subscription charges. Only flat smart contract success fees upon approved milestone payouts.
          </p>
        </m.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Hobby Tier */}
          <m.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="rounded-xl glass border border-white/10 p-8 flex flex-col justify-between bg-white/2 hover:border-indigo-500/20 transition-all duration-300 relative group"
          >
            <div>
              <span className="text-xs font-mono font-semibold text-slate-400 block mb-1">Hobby / Individual</span>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-extrabold font-heading text-white">0%</span>
                <span className="text-slate-500 text-xs font-mono">fee per payout</span>
              </div>
              <p className="text-slate-400 text-xs mb-8 font-sans">
                Best for individual developers testing campaigns locally or raising small community projects.
              </p>
              <ul className="space-y-3 mb-8 border-t border-white/5 pt-6 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  1 Active Campaign Channel
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Up to 2.0 ETH crowdfunding goal
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  AI Oracle auto-verification checks
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  3 Custom milestones support
                </li>
              </ul>
            </div>
            <button 
              onClick={() => window.location.href = "/create"}
              className="btn-glass w-full text-center cursor-pointer"
            >
              Launch Free
            </button>
          </m.div>

          {/* Launchpad Tier */}
          <m.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            className="rounded-xl glass border border-indigo-500/30 p-8 flex flex-col justify-between bg-white/2 hover:border-indigo-500/50 transition-all duration-300 relative group shadow-2xl"
          >
            <div className="absolute top-0 right-4 -translate-y-1/2 px-2.5 py-0.5 rounded-full bg-indigo-500 text-white font-mono text-[9px] font-bold tracking-wider uppercase">
              Recommended
            </div>
            <div>
              <span className="text-xs font-mono font-semibold text-indigo-300 block mb-1">Launchpad / Project</span>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-extrabold font-heading text-white">0.5%</span>
                <span className="text-slate-500 text-xs font-mono">fee per payout</span>
              </div>
              <p className="text-slate-400 text-xs mb-8 font-sans">
                Designed for growing team protocols, decentralized communities, and serious funding goals.
              </p>
              <ul className="space-y-3 mb-8 border-t border-white/5 pt-6 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Unlimited Campaign Channels
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Up to 50.0 ETH goal parameters
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Custom AI Oracle validation criteria
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Up to 10 milestone tranches
                </li>
              </ul>
            </div>
            <button 
              onClick={() => window.location.href = "/create"}
              className="btn-primary w-full text-center cursor-pointer shadow-lg shadow-indigo-500/10"
            >
              Create Campaign
            </button>
          </m.div>

          {/* Enterprise Tier */}
          <m.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.4 }}
            className="rounded-xl glass border border-white/10 p-8 flex flex-col justify-between bg-white/2 hover:border-indigo-500/20 transition-all duration-300 relative group"
          >
            <div>
              <span className="text-xs font-mono font-semibold text-slate-400 block mb-1">Enterprise / DAO</span>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-extrabold font-heading text-white">Custom</span>
                <span className="text-slate-500 text-xs font-mono">payout models</span>
              </div>
              <p className="text-slate-400 text-xs mb-8 font-sans">
                Engineered for DAO governance foundations, grant providers, and private token contracts.
              </p>
              <ul className="space-y-3 mb-8 border-t border-white/5 pt-6 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Custom Multi-Sig Oracle approvals
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Unlimited escrow budgets
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Private cloud AI Oracle nodes
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  SLA response guarantees & support
                </li>
              </ul>
            </div>
            <a 
              href="mailto:support@deposit-protocol.xyz" 
              className="btn-glass w-full text-center cursor-pointer"
            >
              Contact Protocol Swarm
            </a>
          </m.div>
        </div>
      </div>
    </section>
  );
}
