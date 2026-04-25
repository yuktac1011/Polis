import { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import { AuthModal } from './components/Auth/AuthModal';
import { MapContainer } from './components/Map/MapContainer';
import { KanbanBoard } from './components/Kanban/Board';
import { Leaderboard } from './components/Leaderboard/Leaderboard';
import { Sidebar } from './components/Sidebar/Sidebar';
import { TopBar } from './components/TopBar/TopBar';
import { MyIssues } from './components/MyIssues/MyIssues';

type View = 'MAP' | 'KANBAN' | 'LEADERBOARD' | 'MY_ISSUES';

function App() {
  const { currentUser, fetchIssues, isLiveMode, toggleLiveMode } = useStore();
  const [view, setView] = useState<View>('MAP');

  useEffect(() => {
    if (currentUser) {
      fetchIssues();
      const interval = setInterval(fetchIssues, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser, fetchIssues]);

  if (!currentUser) return <AuthModal />;

  const isMLA = currentUser.role === 'ROLE_MLA';

  return (
    <div className="bg-background text-on-background font-body-md text-body-md antialiased min-h-screen flex">
      {/* Sidebar - fixed left */}
      <Sidebar currentView={view} onNavigate={setView} isMLA={isMLA} />

      {/* Main content wrapper - takes remaining space with ml-64 (256px) for the fixed sidebar */}
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <TopBar onLiveToggle={toggleLiveMode} isLiveMode={isLiveMode} />

        {/* ─── Main content ─── All views mounted; CSS visibility toggle ──────── */}
        {/* This prevents Leaflet from being destroyed/remounted on nav changes,   */}
        {/* which caused the world-zoom bug and nav click-through issues.           */}
        <main className="flex-1 overflow-hidden" style={{ position: 'relative' }}>

          {/* MAP — permanently mounted */}
          <div className="absolute inset-0" style={{
            visibility: view === 'MAP' ? 'visible' : 'hidden',
            zIndex: view === 'MAP' ? 1 : 0,
            pointerEvents: view === 'MAP' ? 'auto' : 'none',
          }}>
            <MapContainer />
          </div>

          {/* KANBAN — MLA only */}
          {isMLA && (
            <div className="absolute inset-0 bg-background" style={{
              visibility: view === 'KANBAN' ? 'visible' : 'hidden',
              zIndex: view === 'KANBAN' ? 10 : 0,
              pointerEvents: view === 'KANBAN' ? 'auto' : 'none',
            }}>
              <KanbanBoard />
            </div>
          )}

          <div className="absolute inset-0 bg-background overflow-y-auto" style={{
            visibility: view === 'MY_ISSUES' ? 'visible' : 'hidden',
            zIndex: view === 'MY_ISSUES' ? 10 : 0,
            pointerEvents: view === 'MY_ISSUES' ? 'auto' : 'none',
          }}>
             <MyIssues />
          </div>

          {/* LEADERBOARD */}
          <div className="absolute inset-0 bg-background overflow-y-auto" style={{
            visibility: view === 'LEADERBOARD' ? 'visible' : 'hidden',
            zIndex: view === 'LEADERBOARD' ? 10 : 0,
            pointerEvents: view === 'LEADERBOARD' ? 'auto' : 'none',
          }}>
            <Leaderboard />
          </div>

        </main>
      </div>
    </div>
  );
}

export default App;
