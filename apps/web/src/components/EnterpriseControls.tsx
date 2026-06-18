import { m } from "framer-motion";

export default function EnterpriseControls() {
  return (
    <section className="py-28 border-b border-white/5 bg-[#000000] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <m.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <span className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-widest block mb-3">
              Decentralized Safeguards
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-white tracking-tight mb-6 leading-tight">
              Cryptographic <span className="font-serif italic font-normal tracking-normal gradient-text-purple pr-2">controls</span> built into every campaign.
            </h2>
            <p className="text-slate-400 text-sm md:text-base mb-10 font-sans leading-relaxed">
              No third-party accounts, no manual delays, no custodial risks. Deposit operates directly through audits signed by an automated Oracle running on Base Sepolia and Base Mainnet.
            </p>
            
            <ul className="space-y-4">
              {[
                "Multi-signature Oracle verification hooks",
                "Tamper-resistant audit proof generation, 12 month history",
                "Privileged DAO dispute and override safety mechanisms",
                "Automated smart contract state machines for tranches"
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-slate-300 font-sans text-sm">
                  <svg className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </m.div>

          <m.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            className="rounded-xl glass border border-white/10 p-8 bg-white/2 hover:border-indigo-500/20 transition-all duration-300 relative shadow-2xl"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="font-bold text-white text-lg">Escrow Security Snapshot</h4>
                <p className="text-xs text-slate-500 font-mono">Updated 1 minute ago</p>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 font-mono">
                Grade A+
              </span>
            </div>

            <div className="space-y-5">
              {[
                { label: "Oracle Consensus Accuracy", value: "99.4%" },
                { label: "Automated Build Scans", value: "100%" },
                { label: "On-Chain Multi-Sig Security", value: "99.9%" },
                { label: "Dispute Failsafe Coverage", value: "100%" }
              ].map((stat, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-medium font-mono text-slate-400">
                    <span>{stat.label}</span>
                    <span className="text-white font-bold">{stat.value}</span>
                  </div>
                  <div className="h-2 rounded bg-white/5 overflow-hidden">
                    <m.div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded" 
                      initial={{ width: 0 }}
                      whileInView={{ width: stat.value }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.15 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
}
