import { m } from "framer-motion";

export default function TrustLogos() {
  return (
    <section className="py-12 border-y border-white/5 bg-[#000000] overflow-hidden">
      <m.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="max-w-5xl mx-auto px-6 text-center relative"
      >
        <p className="text-xs font-mono tracking-widest text-[#00c6d4] uppercase mb-8 opacity-80">
          Securing milestone agreements for builders on L2 networks
        </p>
        
        <div className="relative w-full flex items-center overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#000000] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#000000] to-transparent z-10 pointer-events-none" />
          
          <div className="flex whitespace-nowrap animate-marquee opacity-50">
            {[1, 2].map((key) => (
              <div key={key} className="flex gap-16 items-center px-8">
                <span className="text-lg font-bold font-mono tracking-tight text-slate-300 flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1e3a8a]" /> BASE
                </span>
                <span className="text-lg font-bold font-mono tracking-tight text-slate-300 flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7f1d1d]" /> OPTIMISM
                </span>
                <span className="text-lg font-bold font-mono tracking-tight text-slate-300 flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0d9488]" /> ARBITRUM
                </span>
                <span className="text-lg font-bold font-mono tracking-tight text-slate-300 flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#475569]" /> ZKSYNC
                </span>
                <span className="text-lg font-bold font-mono tracking-tight text-slate-300 flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#64748b]" /> ETHEREUM
                </span>
              </div>
            ))}
          </div>
        </div>
      </m.div>
    </section>
  );
}
