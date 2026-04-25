import React, { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import { AadharModal } from './components/Auth/AadharModal';
import { MapContainer } from './components/Map/MapContainer';
import { KanbanBoard } from './components/Kanban/Board';
import { Leaderboard } from './components/Leaderboard/Leaderboard';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const { currentUser, fetchIssues } = useStore();
  const [view, setView] = useState<'MAP' | 'KANBAN'>('MAP');

  useEffect(() => {
    if (currentUser) {
      fetchIssues();
      const interval = setInterval(() => fetchIssues(), 5000);
      return () => clearInterval(interval);
    }
  }, [currentUser, fetchIssues]);

  return (
    <div className="flex h-screen w-screen bg-apple-bg text-apple-text overflow-hidden font-sans">
      {!currentUser && <AadharModal />}

      <div className="flex-1 flex flex-col relative">
        {currentUser && (
          <header className="absolute top-0 left-0 right-0 z-[1000] p-8 flex justify-between items-start pointer-events-none">
            <div className="pointer-events-auto">
              <h1 className="text-[24pt] font-semibold tracking-tight leading-none text-apple-text">Polis</h1>
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${currentUser.role === 'ROLE_MLA' ? 'bg-apple-new' : 'bg-apple-resolved'} animate-pulse`} />
                <span className="text-[10pt] font-bold text-apple-secondary uppercase tracking-widest">
                  {currentUser.role === 'ROLE_MLA' ? `MLA / ${currentUser.mla_id?.replace(/_/g, ' ')}` : `Citizen / ${currentUser.username}`}
                </span>
              </div>
            </div>

            {currentUser.role === 'ROLE_MLA' && (
              <div className="pointer-events-auto bg-apple-surface/80 backdrop-blur-xl p-1.5 rounded-full border border-apple-border flex gap-1 shadow-2xl">
                <button
                  onClick={() => setView('MAP')}
                  className={`px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-500 ${view === 'MAP' ? 'bg-apple-text text-apple-surface shadow-xl' : 'text-apple-secondary hover:text-apple-text hover:bg-black/5'}`}
                >
                  Cartography
                </button>
                <button
                  onClick={() => setView('KANBAN')}
                  className={`px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-500 ${view === 'KANBAN' ? 'bg-apple-text text-apple-surface shadow-xl' : 'text-apple-secondary hover:text-apple-text hover:bg-black/5'}`}
                >
                  Pipeline
                </button>
              </div>
            )}

            <div className="pointer-events-auto flex flex-col items-end">
              <span className="text-[10pt] font-mono text-apple-secondary bg-apple-surface px-3 py-1 rounded-full border border-apple-border shadow-sm">
                {currentUser.citizenHash}
              </span>
            </div>
          </header>
        )}

        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {view === 'MAP' ? (
              <motion.div
                key="map"
                initial={{ opacity: 0, filter: 'blur(10px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(10px)' }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <MapContainer />
              </motion.div>
            ) : (
              <motion.div
                key="kanban"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <KanbanBoard />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {currentUser && (
        <aside className="w-[400px] h-full flex-shrink-0 z-20 relative">
          <Leaderboard />
        </aside>
      )}
    </div>
  );
}

export default App;
