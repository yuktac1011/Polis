import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

export const AadharModal: React.FC = () => {
  const [aadhar, setAadhar] = useState('');
  const [username, setUsername] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useStore(state => state.login);

  const roleText = aadhar.length === 12 
    ? (aadhar.endsWith('00') ? 'System recognizes MLA credentials.' : 'System recognizes Citizen credentials.')
    : 'Identity verification required.';

  const handleNext = () => {
    if (aadhar.length === 12) {
      setIsFlipped(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.length < 3) return;
    
    setLoading(true);
    setError(false);
    
    const success = await login(aadhar, username);
    if (!success) {
      setError(true);
      setLoading(false);
      // Flip back to Aadhar if error is related to Aadhar validation (though Verhoeff is real-time in theory)
      setTimeout(() => setIsFlipped(false), 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-apple-bg/90 backdrop-blur-xl">
      <div className={`identity-card w-[400px] h-[300px] ${isFlipped ? 'is-flipped' : ''}`}>
        <div className="identity-card-inner relative w-full h-full">
          {/* Front: Aadhar Input */}
          <motion.div 
            className="absolute inset-0 bg-apple-surface p-8 rounded-3xl shadow-2xl border border-apple-border flex flex-col justify-between backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-apple-text">System Entry</h1>
              <p className="text-apple-secondary text-sm mt-2">Enter your 12-digit Aadhar</p>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-4">
              <input
                type="text"
                maxLength={12}
                value={aadhar}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setAadhar(val);
                  if (val.length === 12) {
                    setTimeout(() => handleNext(), 500);
                  }
                }}
                className="w-full text-center text-3xl font-mono tracking-[0.3em] p-4 bg-apple-bg border border-apple-border rounded-2xl focus:outline-none focus:border-apple-text transition-all"
                placeholder="0000 0000 0000"
                autoFocus
              />
              <p className={`text-xs text-center transition-colors ${aadhar.length === 12 ? 'text-apple-resolved' : 'text-apple-secondary'}`}>
                {roleText}
              </p>
            </div>

            <button 
              onClick={handleNext}
              disabled={aadhar.length < 12}
              className="w-full py-4 bg-apple-text text-apple-surface rounded-2xl font-medium disabled:opacity-30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Continue
            </button>
          </motion.div>

          {/* Back: Username Input */}
          <motion.div 
            className="absolute inset-0 bg-apple-surface p-8 rounded-3xl shadow-2xl border border-apple-border flex flex-col justify-between"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-apple-text">Choose Alias</h1>
              <p className="text-apple-secondary text-sm mt-2">This will be linked to your hash</p>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-center gap-4">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full text-center text-xl font-medium p-4 bg-apple-bg border border-apple-border rounded-2xl focus:outline-none focus:border-apple-text transition-all"
                placeholder="Desired Username"
                minLength={3}
                required
              />
              {error && <p className="text-apple-progress text-xs text-center">Invalid Aadhar checksum or connection error.</p>}
            </form>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsFlipped(false)}
                className="flex-1 py-4 bg-apple-bg text-apple-text border border-apple-border rounded-2xl font-medium hover:bg-apple-border transition-all"
              >
                Back
              </button>
              <button 
                onClick={handleSubmit}
                disabled={username.length < 3 || loading}
                className="flex-[2] py-4 bg-apple-text text-apple-surface rounded-2xl font-medium disabled:opacity-30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? <div className="w-5 h-5 border-2 border-apple-surface/30 border-t-apple-surface rounded-full animate-spin" /> : 'Authenticate'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
