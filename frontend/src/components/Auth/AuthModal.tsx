import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

type AuthView = 'login' | 'register';

interface AuthModalProps {
  onBack?: () => void;
}

const FloatingLabelInput = ({
  label, type = 'text', value, onChange, placeholder, required, minLength,
}: {
  label: string; type?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; required?: boolean; minLength?: number;
}) => {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        minLength={minLength}
        placeholder={lifted ? placeholder : ''}
        className="w-full h-[56px] px-4 pt-5 pb-1 rounded-2xl text-sm font-medium text-[#1D1D1F] outline-none transition-all duration-200 peer"
        style={{
          background: '#F5F5F7',
          border: `1.5px solid ${focused ? '#1D1D1F' : 'rgba(210,210,215,0.8)'}`,
          boxShadow: focused ? '0 0 0 3px rgba(29,29,31,0.06)' : 'none',
        }}
      />
      <label
        className="absolute left-4 pointer-events-none transition-all duration-200 font-medium"
        style={{
          top: lifted ? '8px' : '50%',
          transform: lifted ? 'none' : 'translateY(-50%)',
          fontSize: lifted ? '10px' : '14px',
          color: focused ? '#1D1D1F' : '#6E6E73',
          letterSpacing: lifted ? '0.08em' : '0',
          fontWeight: lifted ? 700 : 500,
          textTransform: lifted ? 'uppercase' : 'none',
        }}
      >
        {label}
      </label>
    </div>
  );
};

export const AuthModal: React.FC<AuthModalProps> = ({ onBack }) => {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [mlaCode, setMlaCode] = useState('');
  const [mlaWardId, setMlaWardId] = useState('');
  const [showMlaFields, setShowMlaFields] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const { login, register, authError, setAuthError, mlas, fetchMlas } = useStore();

  useEffect(() => { fetchMlas(); }, [fetchMlas]);

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 600); };
  const switchView = (v: AuthView) => { setView(v); setAuthError(null); setPassword(''); setShowMlaFields(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    const success = view === 'login'
      ? await login(email, password)
      : await register(email, password, username, mlaCode || undefined, mlaWardId || undefined);
    if (!success) triggerShake();
    setLoading(false);
  };

  const stats = [
    { val: '2,847', label: 'Issues Reported' },
    { val: '84%', label: 'Resolution Rate' },
    { val: '12K+', label: 'Citizens Active' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden bg-white">
      {/* LEFT PANEL */}
      <div
        className="hidden lg:flex flex-col justify-between w-[52%] p-14 relative overflow-hidden"
        style={{ background: '#1D1D1F' }}
      >
        {/* Ambient background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(100,80,220,0.3) 0%, transparent 70%)' }}
          />
          <motion.div
            animate={{ scale: [1, 0.85, 1.1, 1], x: [0, -20, 40, 0], y: [0, 50, -30, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
            className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(80,180,120,0.25) 0%, transparent 70%)' }}
          />
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-5"
            style={{
              background: 'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.3), transparent)',
            }}
          />
        </div>

        {/* Back button */}
        {onBack && (
          <button
            onClick={onBack}
            className="relative z-10 self-start flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Home
          </button>
        )}

        {/* Main content */}
        <div className="relative z-10 flex flex-col gap-8">
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[20px]">account_balance</span>
              </div>
              <span className="text-white font-black tracking-[-0.04em] text-lg">PROJECT POLIS</span>
            </div>
            <h2 className="text-5xl font-bold text-white leading-tight tracking-tight mb-5">
              Civic intelligence<br />
              <span className="text-white/40">for everyone.</span>
            </h2>
            <p className="text-white/50 text-base leading-relaxed max-w-xs">
              Join thousands of citizens and elected representatives building a more accountable Mumbai.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            {stats.map(({ val, label }) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="text-3xl font-bold text-white">{val}</span>
                <span className="text-xs font-medium text-white/40 uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10 border-t border-white/10 pt-8">
          <p className="text-white/30 text-sm italic leading-relaxed">
            "Democracy is not a spectator sport."
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F5F5F7]">
        <div className="w-full max-w-[400px]">
          {/* Mobile back */}
          {onBack && (
            <button onClick={onBack} className="lg:hidden flex items-center gap-2 text-[#6E6E73] hover:text-[#1D1D1F] transition-colors text-sm font-medium mb-8">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back
            </button>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, x: 20 }}
              animate={shake ? { x: [0, -10, 10, -8, 8, 0] } : { opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={shake ? { duration: 0.45 } : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#1D1D1F] tracking-tight mb-2">
                  {view === 'login' ? 'Welcome back' : 'Create account'}
                </h1>
                <p className="text-[#6E6E73] text-sm">
                  {view === 'login' ? 'Sign in to access the Polis platform.' : 'Join the civic intelligence network.'}
                </p>
              </div>

              {/* Tab switcher */}
              <div className="flex p-1 bg-white border border-[#D2D2D7] rounded-2xl mb-8 shadow-sm">
                {(['login', 'register'] as AuthView[]).map(v => (
                  <button
                    key={v}
                    onClick={() => switchView(v)}
                    className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all relative"
                    style={{ color: view === v ? '#1D1D1F' : '#6E6E73' }}
                  >
                    {view === v && (
                      <motion.div
                        layoutId="auth-tab"
                        className="absolute inset-0 bg-[#F5F5F7] rounded-xl border border-[#D2D2D7]"
                        transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                      />
                    )}
                    <span className="relative z-10">{v === 'login' ? 'Sign In' : 'Register'}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {view === 'register' && (
                  <FloatingLabelInput label="Display Name" value={username} onChange={e => setUsername(e.target.value)} required minLength={3} placeholder="How others see you" />
                )}
                <FloatingLabelInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@city.gov" />
                <FloatingLabelInput label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" />

                {view === 'register' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowMlaFields(!showMlaFields)}
                      className="flex items-center gap-2.5 text-sm font-medium text-[#6E6E73] hover:text-[#1D1D1F] transition-colors"
                    >
                      <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${showMlaFields ? 'bg-[#1D1D1F] border-[#1D1D1F]' : 'border-[#D2D2D7]'}`}>
                        {showMlaFields && <span className="material-symbols-outlined text-white text-[12px]">check</span>}
                      </div>
                      Registering as an elected MLA?
                    </button>
                    <AnimatePresence>
                      {showMlaFields && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-col gap-3 p-4 bg-white border border-[#D2D2D7] rounded-2xl">
                            <input
                              type="password" value={mlaCode} onChange={e => setMlaCode(e.target.value)}
                              className="w-full h-12 px-4 text-sm rounded-xl bg-[#F5F5F7] border border-[#D2D2D7] outline-none focus:border-[#1D1D1F] transition-colors font-mono"
                              placeholder="MLA Access Code"
                            />
                            <select
                              value={mlaWardId} onChange={e => setMlaWardId(e.target.value)}
                              className="w-full h-12 px-4 text-sm rounded-xl bg-[#F5F5F7] border border-[#D2D2D7] outline-none focus:border-[#1D1D1F] transition-colors"
                            >
                              <option value="">Select your ward...</option>
                              {mlas.map(mla => (
                                <option key={mla.id} value={mla.id}>{mla.ward} — {mla.name} ({mla.party})</option>
                              ))}
                            </select>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}

                <AnimatePresence>
                  {authError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium text-center"
                    >
                      {authError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01, boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}
                  whileTap={{ scale: 0.99 }}
                  className="mt-2 w-full h-[54px] rounded-2xl bg-[#1D1D1F] text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.12)] disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{view === 'login' ? 'Enter Polis' : 'Create Identity'}</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
