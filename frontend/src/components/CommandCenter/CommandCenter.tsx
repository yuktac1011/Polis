import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';

export const CommandCenter = () => {
  const { isCommandCenterOpen, setCommandCenterOpen, issues, setSelectedConstituency } = useStore();
  const [query, setQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isCommandCenterOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
      setIsScanning(false);
    }
  }, [isCommandCenterOpen]);

  // Global hotkey (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandCenterOpen(!isCommandCenterOpen);
      }
      if (e.key === 'Escape' && isCommandCenterOpen) {
        setCommandCenterOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandCenterOpen, setCommandCenterOpen]);

  // Mock NLP parsing
  const executeQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsScanning(true);
    setResults([]);

    // Simulate scanning delay
    setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      let matched = issues.filter(i => 
        i.title.toLowerCase().includes(lowerQuery) || 
        i.description.toLowerCase().includes(lowerQuery) ||
        i.category.toLowerCase().includes(lowerQuery)
      );

      // Mock "intent" logic
      if (lowerQuery.includes('critical') || lowerQuery.includes('danger')) {
        matched = issues.filter(i => i.status === 'New');
      } else if (lowerQuery.includes('resolved') || lowerQuery.includes('fixed')) {
        matched = issues.filter(i => i.status === 'Resolved');
      }

      setResults(matched.slice(0, 5)); // show top 5
      setIsScanning(false);

      // "Auto-zoom" effect if ward is mentioned
      if (lowerQuery.includes('dharavi')) setSelectedConstituency('dharavi');
      if (lowerQuery.includes('colaba')) setSelectedConstituency('colaba');

    }, 1500);
  };

  return (
    <AnimatePresence>
      {isCommandCenterOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCommandCenterOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-3xl bg-[#111111] border border-white/10 rounded-2xl shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)] overflow-hidden flex flex-col"
          >
            {/* Scanning Laser Animation */}
            {isScanning && (
              <motion.div 
                initial={{ top: 0 }}
                animate={{ top: '100%' }}
                transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
                className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#4edea3] to-transparent shadow-[0_0_10px_#4edea3] z-50 pointer-events-none"
              />
            )}

            {/* Input Area */}
            <form onSubmit={executeQuery} className="relative flex items-center px-6 py-5 border-b border-white/5">
              <span className="material-symbols-outlined text-[#4edea3] mr-4 font-light text-2xl">magic_button</span>
              <input 
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask Polis... (e.g. 'Show critical issues in Dharavi')"
                className="flex-1 bg-transparent border-none outline-none text-white font-mono text-lg placeholder:text-white/30"
              />
              <div className="flex items-center gap-2 text-white/30 font-mono text-xs">
                <kbd className="px-2 py-1 bg-white/5 rounded border border-white/10">ESC</kbd> to close
              </div>
            </form>

            {/* Results Area */}
            {isScanning ? (
              <div className="px-6 py-12 flex flex-col items-center justify-center gap-4">
                <div className="w-6 h-6 border-2 border-[#4edea3]/20 border-t-[#4edea3] rounded-full animate-spin" />
                <p className="font-mono text-[#4edea3]/70 text-sm animate-pulse">Scanning civic ledger...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="max-h-[60vh] overflow-y-auto">
                <div className="px-6 py-3 border-b border-white/5 bg-white/[0.02]">
                  <p className="font-mono text-xs text-white/40 tracking-wider">ACTIONABLE INTELLIGENCE ({results.length} MATCHES)</p>
                </div>
                {results.map((issue, idx) => (
                  <motion.div 
                    key={issue.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="px-6 py-4 border-b border-white/5 hover:bg-white/[0.03] cursor-pointer flex flex-col gap-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${issue.status === 'Resolved' ? 'bg-[#76777d]' : issue.status === 'In Progress' ? 'bg-[#002113]' : 'bg-[#ba1a1a]'}`} />
                        <span className="font-mono text-sm text-white/90 group-hover:text-white transition-colors">{issue.title}</span>
                      </div>
                      <span className="font-mono text-[10px] text-[#4edea3]/60 bg-[#4edea3]/10 px-2 py-0.5 rounded border border-[#4edea3]/20">
                        {issue.category.toUpperCase()}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-white/40 pl-5 line-clamp-1 group-hover:text-white/60 transition-colors">
                      {issue.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : query && !isScanning ? (
              <div className="px-6 py-12 flex flex-col items-center justify-center gap-2">
                <span className="material-symbols-outlined text-white/20 text-4xl mb-2">find_in_page</span>
                <p className="font-mono text-white/40 text-sm">No actionable intelligence found for your query.</p>
              </div>
            ) : null}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
