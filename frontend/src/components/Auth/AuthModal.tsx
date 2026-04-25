import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

type AuthView = 'login' | 'register';

export const AuthModal: React.FC = () => {
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

  useEffect(() => {
    fetchMlas();
  }, [fetchMlas]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const switchView = (v: AuthView) => {
    setView(v);
    setAuthError(null);
    setPassword('');
    setShowMlaFields(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    let success = false;
    if (view === 'login') {
      success = await login(email, password);
    } else {
      success = await register(email, password, username, mlaCode || undefined, mlaWardId || undefined);
    }

    if (!success) triggerShake();
    setLoading(false);
  };

  const partyColors: Record<string, string> = {
    BJP: '#FF6B00', INC: '#00A651', 'SS-UBT': '#FF0000', SP: '#FF0000', NCP: '#0070B8',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden font-body-md text-on-surface antialiased bg-background">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <img alt="City background" className="w-full h-full object-cover opacity-80 mix-blend-multiply" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSxgQcdgkbUPYFMmjmsC1sXXByVPZJPhm6y15bANEcLcvJHMosDdeFyXNqEOQ2FbLg7_F7gHY7Uro95E2KIYOk94ukmQWxJ3zAjSf0P8bs8rcxhsPfixzQmamFiOjNGmp2bWgiL4M3b6AquzpyAZEIW6u2Eu5JsXw4eEirJ3RWO7It1UZF0t7V8p6nSzWF6RAutZ0bWObgjaEM5qMLyXC3bVtYwu1LQJNLmonX4SAhQLg6Cv0YqbS0kENS0Y2WGtIzy5fjvbg3mSj_" />
        {/* Heavy Blur Overlay to push focus to the card */}
        <div className="absolute inset-0 backdrop-blur-[40px] bg-surface/50"></div>
        {/* Subtle Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent"></div>
      </div>

      <div className="relative z-10 w-full max-w-[480px] px-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={shake ? { x: [0, -10, 10, -8, 8, 0] } : { opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={shake ? { duration: 0.5 } : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="bg-surface/80 backdrop-blur-2xl rounded-[32px] border border-outline-variant/30 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden"
          >
            {/* Header Area in Card */}
            <div className="p-xl pb-md flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-surface-container-high border border-outline-variant/50 flex items-center justify-center mb-lg shadow-sm">
                <span className="material-symbols-outlined text-[32px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  shield_lock
                </span>
              </div>
              <h1 className="font-h1 text-h1 text-on-surface mb-xs">Civic Hub</h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-[300px] mx-auto">
                Secure access for citizens and officials.
              </p>
            </div>

            {/* Tab switcher */}
            <div className="flex border-b border-outline-variant/30">
              {(['login', 'register'] as AuthView[]).map((v) => (
                <button
                  key={v}
                  onClick={() => switchView(v)}
                  className={`flex-1 py-4 text-sm font-semibold transition-all ${
                    view === v
                      ? 'text-primary border-b-2 border-primary bg-surface-container-low/50'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {v === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="p-xl pt-lg flex flex-col gap-5 w-full">
              {view === 'register' && (
                <div className="relative w-full text-left">
                  <label className="font-label-caps text-label-caps text-on-surface-variant block mb-sm tracking-widest pl-xs">DISPLAY NAME</label>
                  <input
                    required minLength={3} value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-[56px] px-lg rounded-xl bg-surface-container-lowest/50 backdrop-blur-md border border-outline-variant/50 text-left font-body-lg text-body-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all duration-300 placeholder:text-outline/50"
                    placeholder="How others will see you"
                  />
                </div>
              )}

              <div className="relative w-full text-left">
                <label className="font-label-caps text-label-caps text-on-surface-variant block mb-sm tracking-widest pl-xs">EMAIL</label>
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[56px] px-lg rounded-xl bg-surface-container-lowest/50 backdrop-blur-md border border-outline-variant/50 text-left font-body-lg text-body-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all duration-300 placeholder:text-outline/50"
                  placeholder="you@city.gov"
                />
              </div>

              <div className="relative w-full text-left">
                <label className="font-label-caps text-label-caps text-on-surface-variant block mb-sm tracking-widest pl-xs">PASSWORD</label>
                <input
                  type="password" required minLength={6} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[56px] px-lg rounded-xl bg-surface-container-lowest/50 backdrop-blur-md border border-outline-variant/50 text-left font-body-lg text-body-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all duration-300 placeholder:text-outline/50"
                  placeholder="••••••••"
                />
              </div>

              {view === 'register' && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowMlaFields(!showMlaFields)}
                    className="flex items-center gap-2 font-caption text-caption text-on-surface-variant hover:text-on-surface transition-colors group"
                  >
                    <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${showMlaFields ? 'bg-primary border-primary text-on-primary' : 'border-outline-variant'}`}>
                      {showMlaFields && <span className="material-symbols-outlined text-[14px]">check</span>}
                    </div>
                    <span>Registering as an elected MLA?</span>
                  </button>

                  <AnimatePresence>
                    {showMlaFields && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col gap-4 p-5 bg-surface-container-low/50 rounded-2xl border border-outline-variant/50 mt-2">
                          <div className="relative w-full text-left">
                            <label className="font-label-caps text-label-caps text-on-surface-variant block mb-sm tracking-widest pl-xs">ACCESS CODE</label>
                            <input
                              type="password" value={mlaCode}
                              onChange={(e) => setMlaCode(e.target.value)}
                              className="w-full h-[48px] px-md rounded-xl bg-surface-container-lowest/50 border border-outline-variant/50 text-left font-mono focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                              placeholder="Issued by Electoral Commission"
                            />
                          </div>
                          <div className="relative w-full text-left">
                            <label className="font-label-caps text-label-caps text-on-surface-variant block mb-sm tracking-widest pl-xs">YOUR WARD</label>
                            <select
                              value={mlaWardId}
                              onChange={(e) => setMlaWardId(e.target.value)}
                              className="w-full h-[48px] px-md rounded-xl bg-surface-container-lowest/50 border border-outline-variant/50 text-left font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                            >
                              <option value="">Select your ward...</option>
                              {mlas.map((mla) => (
                                <option key={mla.id} value={mla.id}>
                                  {mla.ward} — {mla.name} ({mla.party})
                                </option>
                              ))}
                            </select>
                          </div>
                          {mlaWardId && mlas.find(m => m.id === mlaWardId) && (
                            <div className="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/50 mt-1">
                              <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: partyColors[mlas.find(m => m.id === mlaWardId)?.party || ''] || '#6E6E73' }}
                              />
                              <div>
                                <p className="text-sm font-semibold text-on-surface">{mlas.find(m => m.id === mlaWardId)?.name}</p>
                                <p className="text-xs text-on-surface-variant">{mlas.find(m => m.id === mlaWardId)?.constituency}</p>
                              </div>
                            </div>
                          )}
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
                    className="p-3 bg-error-container text-on-error-container border border-error/30 rounded-xl font-caption text-caption font-medium text-center"
                  >
                    {authError}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full h-[56px] rounded-xl bg-primary text-on-primary font-body-lg text-body-lg flex items-center justify-center gap-sm hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-on-primary/20 border-t-on-primary rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{view === 'login' ? 'Enter Civic Hub' : 'Create Identity'}</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
