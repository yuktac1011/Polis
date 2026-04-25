import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';

// ── Animated Number Counter ────────────────────────────────────────────────────
const Counter = ({ to, suffix = '', prefix = '' }: { to: number; suffix?: string; prefix?: string }) => {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const duration = 1800;
      const tick = (ts: number) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        setVal(Math.floor(eased * to));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
};

// ── 3D Tilt Card ──────────────────────────────────────────────────────────────
const TiltCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const glare = useMotionValue(0);

  const onMove = useCallback((e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    rotX.set(((e.clientY - cy) / (rect.height / 2)) * -8);
    rotY.set(((e.clientX - cx) / (rect.width / 2)) * 8);
    glare.set(((e.clientX - rect.left) / rect.width) * 100);
  }, []);

  const onLeave = () => { rotX.set(0); rotY.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d', perspective: 1000 }}
      transition={{ type: 'spring', stiffness: 400, damping: 40 }}
      whileHover={{ scale: 1.02, boxShadow: '0 40px 80px -20px rgba(0,0,0,0.2)' }}
      className={`cursor-pointer ${className}`}
      initial={{ boxShadow: '0 8px 32px -8px rgba(0,0,0,0.1)' }}
    >
      {children}
    </motion.div>
  );
};

// ── Main Landing Page ─────────────────────────────────────────────────────────
export const LandingPage = ({ onEnter }: { onEnter: () => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const heroX = useTransform(mouseX, [-800, 800], [-15, 15]);
  const heroY = useTransform(mouseY, [-500, 500], [-10, 10]);
  const orb1X = useTransform(mouseX, [-800, 800], [-60, 60]);
  const orb1Y = useTransform(mouseY, [-500, 500], [-50, 50]);
  const orb2X = useTransform(mouseX, [-800, 800], [50, -50]);
  const orb2Y = useTransform(mouseY, [-500, 500], [40, -40]);
  const orb3X = useTransform(mouseX, [-800, 800], [-30, 30]);
  const orb3Y = useTransform(mouseY, [-500, 500], [25, -25]);

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    const onScroll = () => setScrolled((containerRef.current?.scrollTop ?? 0) > 80);
    window.addEventListener('mousemove', onMouse);
    containerRef.current?.addEventListener('scroll', onScroll);
    const el = containerRef.current;
    return () => {
      window.removeEventListener('mousemove', onMouse);
      el?.removeEventListener('scroll', onScroll);
    };
  }, []);

  const featureCards = [
    {
      span: 'col-span-2',
      bg: 'bg-white',
      icon: 'map',
      iconColor: 'text-blue-500',
      label: 'Cartographic Intelligence',
      desc: 'High-precision city map with live issue pins. Click any ward to dive into hyper-local civic data.',
      extra: (
        <div className="mt-6 flex gap-2">
          {['Infrastructure', 'Sanitation', 'Safety'].map(t => (
            <span key={t} className="px-3 py-1 bg-[#F5F5F7] rounded-full text-xs font-semibold text-[#6E6E73]">{t}</span>
          ))}
        </div>
      ),
    },
    {
      span: 'col-span-1',
      bg: 'bg-[#1D1D1F]',
      icon: 'verified',
      iconColor: 'text-green-400',
      label: 'MLA Accountability',
      desc: 'Every issue is linked to the elected representative responsible. No ambiguity.',
      dark: true,
      extra: (
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-4xl font-bold text-white">100%</p>
          <p className="text-xs text-white/40 mt-1 font-medium uppercase tracking-widest">Traceability</p>
        </div>
      ),
    },
    {
      span: 'col-span-1',
      bg: 'bg-emerald-50',
      icon: 'bolt',
      iconColor: 'text-emerald-600',
      label: 'Real-Time Pulse',
      desc: 'WebSocket-powered live feed. Every resolution pulses across the city.',
      extra: (
        <div className="mt-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-emerald-700">LIVE NOW</span>
        </div>
      ),
    },
    {
      span: 'col-span-2',
      bg: 'bg-white',
      icon: 'monitoring',
      iconColor: 'text-amber-500',
      label: 'Institutional Analytics',
      desc: 'Predictive resolution timelines, ward health scores, and MLA performance rankings.',
      extra: (
        <div className="mt-6 flex items-end gap-1.5 h-12">
          {[40, 65, 50, 80, 70, 90, 75, 95].map((h, i) => (
            <motion.div
              key={i}
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 300 }}
              style={{ height: `${h}%`, originY: 1 }}
              className="flex-1 bg-amber-400/60 rounded-sm"
            />
          ))}
        </div>
      ),
    },
  ];

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen overflow-y-auto overflow-x-hidden bg-[#F5F5F7] text-[#1D1D1F] font-sans"
      style={{ scrollbarWidth: 'none' }}
    >
      {/* Floating nav pill */}
      <AnimatePresence>
        {scrolled && (
          <motion.nav
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-8 px-8 py-3 bg-white/75 backdrop-blur-2xl rounded-full border border-[#D2D2D7]/60 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#1D1D1F] flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[14px]">account_balance</span>
              </div>
              <span className="text-sm font-black tracking-[-0.04em]">POLIS</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#features" className="text-xs font-semibold text-[#6E6E73] hover:text-[#1D1D1F] transition-colors">Features</a>
              <a href="#impact" className="text-xs font-semibold text-[#6E6E73] hover:text-[#1D1D1F] transition-colors">Impact</a>
            </div>
            <button
              onClick={onEnter}
              className="px-5 py-2 bg-[#1D1D1F] text-white rounded-full text-xs font-bold hover:bg-black transition-all active:scale-95"
            >
              Enter Platform
            </button>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* ── HERO ── */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden px-6">
        {/* Ambient orbs */}
        <motion.div
          style={{ x: orb1X, y: orb1Y }}
          className="absolute top-[-100px] left-[-200px] w-[700px] h-[700px] rounded-full pointer-events-none"
          animate={{ scale: [1, 1.12, 0.96, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div style={{ width: '100%', height: '100%', background: 'radial-gradient(circle, rgba(199,215,250,0.8) 0%, rgba(199,215,250,0.2) 50%, transparent 70%)', filter: 'blur(60px)', borderRadius: '50%' }} />
        </motion.div>
        <motion.div
          style={{ x: orb2X, y: orb2Y }}
          className="absolute bottom-[-100px] right-[-150px] w-[600px] h-[600px] rounded-full pointer-events-none"
          animate={{ scale: [1, 0.9, 1.1, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        >
          <div style={{ width: '100%', height: '100%', background: 'radial-gradient(circle, rgba(250,215,199,0.6) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        </motion.div>
        <motion.div
          style={{ x: orb3X, y: orb3Y }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] pointer-events-none"
          animate={{ rotate: [0, 5, -3, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div style={{ width: '100%', height: '100%', background: 'radial-gradient(ellipse, rgba(214,199,250,0.3) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        </motion.div>

        {/* Static nav (before scroll) */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-10 py-6 z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1D1D1F] flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-white text-[18px]">account_balance</span>
            </div>
            <span className="text-base font-black tracking-[-0.04em]">PROJECT POLIS</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-[#6E6E73] hover:text-[#1D1D1F] transition-colors">Features</a>
            <a href="#impact" className="text-sm font-medium text-[#6E6E73] hover:text-[#1D1D1F] transition-colors">Impact</a>
            <button
              onClick={onEnter}
              className="px-6 py-2.5 bg-white text-[#1D1D1F] rounded-full text-sm font-bold border border-[#D2D2D7] hover:bg-[#F5F5F7] transition-all shadow-sm active:scale-95"
            >
              Access Platform
            </button>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-[#D2D2D7]/60 rounded-full text-xs font-bold text-[#6E6E73] mb-10 shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE · MUMBAI CIVIC INFRASTRUCTURE
          </motion.div>

          <motion.div style={{ x: heroX, y: heroY }}>
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-[80px] md:text-[108px] font-bold leading-[0.88] tracking-[-0.04em] mb-8 select-none"
            >
              Institutional
              <br />
              <span className="text-[#6E6E73]">Intelligence.</span>
            </motion.h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="text-xl text-[#6E6E73] max-w-xl px-4 mb-12 leading-relaxed font-medium"
          >
            The platform where citizens hold power accountable. Precise issue tracking, real-time MLA performance, and data-driven civic governance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65 }}
            className="flex flex-col sm:flex-row gap-4 items-center"
          >
            <motion.button
              onClick={onEnter}
              whileHover={{ scale: 1.04, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}
              whileTap={{ scale: 0.97 }}
              className="group px-10 py-4 bg-[#1D1D1F] text-white rounded-2xl text-base font-bold flex items-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.18)]"
            >
              Launch Dashboard
              <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-4 bg-white/80 backdrop-blur-md text-[#1D1D1F] rounded-2xl text-base font-semibold border border-[#D2D2D7] hover:bg-white transition-colors shadow-sm"
            >
              View Public Reports
            </motion.button>
          </motion.div>
        </div>

        {/* Floating mini dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{ perspective: 1200 }}
          className="absolute bottom-[-80px] left-1/2 -translate-x-1/2 w-[480px] hidden lg:block"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ rotateX: 12 }}
            className="w-full h-[200px] bg-white/80 backdrop-blur-2xl border border-[#D2D2D7]/60 rounded-3xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.25)] overflow-hidden p-5 flex gap-4"
          >
            <div className="flex-1 flex flex-col gap-2">
              <div className="text-[9px] font-bold text-[#6E6E73] uppercase tracking-widest mb-1">Live Issues</div>
              {['Broken streetlight, Andheri', 'Pothole, Worli Seaface', 'Drainage overflow, Bandra'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-[#F5F5F7] rounded-lg">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${i === 0 ? 'bg-red-500' : i === 1 ? 'bg-amber-500' : 'bg-blue-500'}`} />
                  <span className="text-[10px] font-medium text-[#1D1D1F] truncate">{item}</span>
                </div>
              ))}
            </div>
            <div className="w-28 flex flex-col gap-2">
              <div className="text-[9px] font-bold text-[#6E6E73] uppercase tracking-widest mb-1">Resolution Rate</div>
              <div className="flex-1 bg-[#F5F5F7] rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">84%</p>
                  <p className="text-[9px] text-[#6E6E73] font-medium">This Month</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-emerald-50 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold text-emerald-700">LIVE</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-6 h-10 rounded-full border-2 border-[#D2D2D7] flex items-start justify-center pt-2"
          >
            <div className="w-1 h-2.5 rounded-full bg-[#6E6E73]/60" />
          </motion.div>
          <span className="text-[10px] font-semibold text-[#6E6E73] uppercase tracking-widest">Scroll</span>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section id="impact" className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-widest mb-4">Platform Impact</p>
            <h2 className="text-5xl font-bold tracking-tight">Numbers that matter.</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#F5F5F7]">
            {[
              { val: 2847, suffix: '+', label: 'Issues Reported' },
              { val: 84, suffix: '%', label: 'Resolution Rate' },
              { val: 18, suffix: '', label: 'Active MLAs' },
              { val: 12400, suffix: '+', label: 'Citizens Served' },
            ].map(({ val, suffix, label }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="bg-white p-10 text-center"
              >
                <p className="text-5xl font-bold tracking-tight mb-2">
                  <Counter to={val} suffix={suffix} />
                </p>
                <p className="text-sm font-medium text-[#6E6E73]">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-28 bg-[#F5F5F7]">
        <div className="max-w-6xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-widest mb-4">Capabilities</p>
            <h2 className="text-5xl font-bold tracking-tight max-w-lg">Built for real governance.</h2>
          </motion.div>

          <div className="grid grid-cols-3 gap-4">
            {featureCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className={card.span}
              >
                <TiltCard className={`h-full ${card.bg} rounded-[28px] p-10 border border-[#D2D2D7]/30`}>
                  <span className={`material-symbols-outlined text-[40px] ${card.iconColor} mb-6 block`} style={{ fontVariationSettings: "'FILL' 1" }}>{card.icon}</span>
                  <h3 className={`text-2xl font-bold mb-3 ${card.dark ? 'text-white' : 'text-[#1D1D1F]'}`}>{card.label}</h3>
                  <p className={`text-base leading-relaxed ${card.dark ? 'text-white/60' : 'text-[#6E6E73]'}`}>{card.desc}</p>
                  {card.extra}
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-28 bg-[#1D1D1F]">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
          >
            <h2 className="text-6xl font-bold text-white tracking-tight mb-6 leading-tight">
              Your city.<br />Your accountability.
            </h2>
            <p className="text-xl text-white/50 mb-12 max-w-lg mx-auto">
              Join thousands of citizens actively shaping Mumbai's infrastructure, one issue at a time.
            </p>
            <motion.button
              onClick={onEnter}
              whileHover={{ scale: 1.04, backgroundColor: '#fff' }}
              whileTap={{ scale: 0.97 }}
              className="px-12 py-5 bg-white text-[#1D1D1F] rounded-2xl text-lg font-bold shadow-[0_8px_40px_rgba(255,255,255,0.15)] transition-colors"
            >
              Enter Polis
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-16 bg-[#F5F5F7] border-t border-[#D2D2D7]/60">
        <div className="max-w-6xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1D1D1F] flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[16px]">account_balance</span>
            </div>
            <span className="font-black tracking-[-0.04em]">PROJECT POLIS</span>
          </div>
          <p className="text-sm text-[#6E6E73]">Built for Horizon '26 Hackathon · Civic Intelligence Platform</p>
          <div className="flex items-center gap-6 text-xs font-bold text-[#6E6E73] uppercase tracking-widest">
            <a href="#" className="hover:text-[#1D1D1F] transition-colors">Github</a>
            <a href="#" className="hover:text-[#1D1D1F] transition-colors">Docs</a>
            <a href="#" className="hover:text-[#1D1D1F] transition-colors">SVKM</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
