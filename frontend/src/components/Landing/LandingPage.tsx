import { motion } from 'framer-motion';

export const LandingPage = ({ onEnter }: { onEnter: () => void }) => {
  return (
    <div className="min-h-screen bg-apple-bg text-apple-text font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-xl py-lg max-w-7xl mx-auto">
        <div className="flex items-center gap-sm">
          <div className="w-10 h-10 rounded-lg bg-apple-new flex items-center justify-center text-white">
            <span className="material-symbols-outlined">account_balance</span>
          </div>
          <span className="text-xl font-black tracking-tighter">PROJECT POLIS</span>
        </div>
        <div className="flex items-center gap-xl">
          <a href="#features" className="text-sm font-medium text-apple-secondary hover:text-apple-text transition-colors">Features</a>
          <a href="#impact" className="text-sm font-medium text-apple-secondary hover:text-apple-text transition-colors">Impact</a>
          <button 
            onClick={onEnter}
            className="px-6 py-2 bg-apple-new text-white rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Access Ledger
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-xxl pb-32 px-xl max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-apple-resolved/10 text-apple-resolved rounded-full text-xs font-bold mb-8 border border-apple-resolved/20"
        >
          <span className="w-2 h-2 rounded-full bg-apple-resolved animate-pulse"></span>
          LIVE MUMBAI CIVIC STATUS: ACTIVE
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-[64px] md:text-[88px] font-bold leading-[0.95] tracking-tight mb-8"
        >
          Institutional Intelligence <br />
          <span className="text-apple-secondary opacity-50">for Civic Governance.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-apple-secondary max-w-2xl mb-12 leading-relaxed"
        >
          The Swiss Watch of civic platforms. Precise issue tracking, real-time MLA accountability, and data-driven infrastructure management.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col md:flex-row gap-4 items-center"
        >
          <button 
            onClick={onEnter}
            className="px-10 py-5 bg-apple-new text-white rounded-2xl text-lg font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10 flex items-center gap-3"
          >
            Launch Dashboard
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
          <button className="px-10 py-5 bg-white text-apple-text border border-apple-border rounded-2xl text-lg font-semibold hover:bg-apple-bg transition-all">
            View Public Reports
          </button>
        </motion.div>
      </section>

      {/* Feature Bento Grid */}
      <section id="features" className="py-32 bg-white border-t border-apple-border">
        <div className="max-w-7xl mx-auto px-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-2 bg-apple-bg rounded-[32px] p-12 overflow-hidden relative group">
              <div className="relative z-10">
                <span className="material-symbols-outlined text-[48px] text-apple-new mb-6">map</span>
                <h3 className="text-3xl font-bold mb-4">Cartographic Discovery</h3>
                <p className="text-apple-secondary text-lg max-w-md">
                  Explore your city through a high-precision SVG map. Report issues with millimeter accuracy and track them through the city ledger.
                </p>
              </div>
              <div className="absolute right-0 bottom-0 w-2/3 h-2/3 bg-apple-border/20 translate-x-1/4 translate-y-1/4 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
            </div>

            <div className="bg-apple-new text-white rounded-[32px] p-12 flex flex-col justify-between">
              <div>
                <span className="material-symbols-outlined text-[48px] mb-6">verified</span>
                <h3 className="text-3xl font-bold mb-4">MLA Verified</h3>
                <p className="text-white/70 text-lg">
                  Every issue is directly linked to the responsible Representative. No more guessing who is in charge.
                </p>
              </div>
              <div className="pt-8 border-t border-white/10 mt-8">
                <span className="text-[48px] font-bold">100%</span>
                <p className="text-white/50 text-sm">Accountability Guaranteed</p>
              </div>
            </div>

            <div className="bg-apple-resolved/10 rounded-[32px] p-12 border border-apple-resolved/20">
              <span className="material-symbols-outlined text-[48px] text-apple-resolved mb-6">bolt</span>
              <h3 className="text-3xl font-bold mb-4">Real-time Pulse</h3>
              <p className="text-apple-secondary text-lg">
                The City Pulse feed updates in real-time. Witness infrastructure transformations as they happen.
              </p>
            </div>

            <div className="col-span-2 bg-apple-bg rounded-[32px] p-12 border border-apple-border flex flex-col md:flex-row items-center gap-12">
               <div className="flex-1">
                <span className="material-symbols-outlined text-[48px] text-apple-progress mb-6">monitoring</span>
                <h3 className="text-3xl font-bold mb-4">Institutional Analytics</h3>
                <p className="text-apple-secondary text-lg">
                  Advanced data modeling for city planning. Predictive resolution timelines and sectoral health monitoring.
                </p>
               </div>
               <div className="w-full md:w-64 h-48 bg-white rounded-2xl border border-apple-border shadow-sm p-4 flex flex-col gap-2">
                 <div className="h-4 w-1/2 bg-apple-border/30 rounded-full"></div>
                 <div className="h-8 w-full bg-apple-resolved/20 rounded-lg"></div>
                 <div className="h-8 w-3/4 bg-apple-progress/20 rounded-lg"></div>
                 <div className="h-8 w-full bg-apple-new/10 rounded-lg"></div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-apple-bg border-t border-apple-border text-center">
        <div className="max-w-7xl mx-auto px-xl">
          <div className="flex items-center justify-center gap-sm mb-8">
            <div className="w-8 h-8 rounded bg-apple-new flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-sm">account_balance</span>
            </div>
            <span className="text-sm font-black tracking-tighter">PROJECT POLIS</span>
          </div>
          <p className="text-apple-secondary text-sm mb-8">
            Built for the Horizon '26 Hackathon. Institutional Minimalist Design.
          </p>
          <div className="flex items-center justify-center gap-xl text-xs font-bold text-apple-secondary uppercase tracking-widest">
            <a href="#" className="hover:text-apple-text">Github</a>
            <a href="#" className="hover:text-apple-text">Documentation</a>
            <a href="#" className="hover:text-apple-text">SVKM Credits</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
