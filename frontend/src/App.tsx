import { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import { AuthModal } from './components/Auth/AuthModal';
import { MapContainer } from './components/Map/MapContainer';
import { KanbanBoard } from './components/Kanban/Board';
import { Sidebar } from './components/Sidebar/Sidebar';
import { TopBar } from './components/TopBar/TopBar';
import { Leaderboard } from './components/Leaderboard/Leaderboard';
import { CommandCenter } from './components/CommandCenter/CommandCenter';
import { LandingPage } from './components/Landing/LandingPage';
import { AnalyticsView } from './components/Analytics/AnalyticsView';
import { ArchiveView } from './components/Archive/ArchiveView';
import { MyIssues } from './components/MyIssues/MyIssues';

export type View = 'MAP' | 'KANBAN' | 'LEADERBOARD' | 'ANALYTICS' | 'ARCHIVE' | 'MY_ISSUES';

function App() {
  const { currentUser, fetchIssues, fetchTrendingIssues, isLiveMode, toggleLiveMode, initSocket } = useStore();
  const [view, setView] = useState<View>('MAP');
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchIssues();
      fetchTrendingIssues();
      const cleanup = initSocket();
      
      const interval = setInterval(() => {
        fetchIssues();
        fetchTrendingIssues();
      }, 30000);
      
      return () => {
        clearInterval(interval);
        if (cleanup) cleanup();
      };
    }
  }, [currentUser, fetchIssues, fetchTrendingIssues, initSocket]);

  if (!currentUser && !showAuth) {
    return <LandingPage onEnter={() => setShowAuth(true)} />;
  }

  if (!currentUser && showAuth) {
    return <AuthModal onBack={() => setShowAuth(false)} />;
  }

  if (!currentUser) return null;



  return (
    <div className="bg-background text-on-background font-body-md text-body-md antialiased min-h-screen flex">
      {/* Sidebar - fixed left */}
      <Sidebar currentView={view} onNavigate={setView} />

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

          {/* KANBAN — Read-only for citizens, interactive for MLAs */}
          <div className="absolute inset-0 bg-background" style={{
            visibility: view === 'KANBAN' ? 'visible' : 'hidden',
            zIndex: view === 'KANBAN' ? 10 : 0,
            pointerEvents: view === 'KANBAN' ? 'auto' : 'none',
          }}>
            <KanbanBoard />
          </div>

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

          {/* ANALYTICS */}
          <div className="absolute inset-0 bg-background overflow-y-auto" style={{
            visibility: view === 'ANALYTICS' ? 'visible' : 'hidden',
            zIndex: view === 'ANALYTICS' ? 10 : 0,
            pointerEvents: view === 'ANALYTICS' ? 'auto' : 'none',
          }}>
            <AnalyticsView />
          </div>

          {/* ARCHIVE */}
          <div className="absolute inset-0 bg-background overflow-y-auto" style={{
            visibility: view === 'ARCHIVE' ? 'visible' : 'hidden',
            zIndex: view === 'ARCHIVE' ? 10 : 0,
            pointerEvents: view === 'ARCHIVE' ? 'auto' : 'none',
          }}>
            <ArchiveView />
          </div>

        </main>
      </div>
      <CommandCenter />
    </div>
  );
}

export default App;
