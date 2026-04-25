import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';

interface TopBarProps {
  onLiveToggle: () => void;
  isLiveMode: boolean;
}

export function TopBar({ onLiveToggle, isLiveMode }: TopBarProps) {
  const { currentUser, setCommandCenterOpen } = useStore();
  if (!currentUser) return null;

  const isMLA = currentUser.role === 'ROLE_MLA';

  return (
    <header
      className="sticky top-0 z-30 h-14 flex items-center px-6 gap-4"
      style={{
        background: 'rgba(245,245,247,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(210,210,215,0.5)',
      }}
    >
      {/* Page title / breadcrumb area — empty, reserved */}
      <div className="flex-1" />

      {/* Search Trigger */}
      <motion.button
        onClick={() => setCommandCenterOpen(true)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-[#6E6E73] transition-all"
        style={{
          background: 'rgba(255,255,255,0.8)',
          border: '1px solid rgba(210,210,215,0.6)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          minWidth: 220,
        }}
      >
        <span className="material-symbols-outlined text-[16px]">search</span>
        <span className="flex-1 text-left text-[13px] font-medium">Ask Polis...</span>
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[#F5F5F7] border border-[#D2D2D7] rounded text-[#6E6E73]">⌘K</kbd>
      </motion.button>

      {/* Live Pulse Toggle */}
      <motion.button
        onClick={onLiveToggle}
        whileTap={{ scale: 0.95 }}
        className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all"
        style={
          isLiveMode
            ? { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444' }
            : { background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(210,210,215,0.6)', color: '#6E6E73' }
        }
      >
        {isLiveMode && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-red-400/10"
            animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        <span className={`relative w-1.5 h-1.5 rounded-full ${isLiveMode ? 'bg-red-500' : 'bg-[#6E6E73]'}`}>
          {isLiveMode && (
            <motion.span
              className="absolute inset-0 rounded-full bg-red-500"
              animate={{ scale: [1, 2.5, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </span>
        <span className="relative">{isLiveMode ? 'Pulse Active' : 'Start Pulse'}</span>
      </motion.button>

      {/* Role badge */}
      {isMLA && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
          <span className="material-symbols-outlined text-emerald-600 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          <span className="text-xs font-bold text-emerald-700">MLA</span>
        </div>
      )}
    </header>
  );
}
