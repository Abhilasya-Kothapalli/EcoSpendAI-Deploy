import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import Leaderboard from './components/Leaderboard';
import Marketplace from './components/Marketplace';
import ChatAdvisor from './components/ChatAdvisor';
import Profile from './components/Profile';
import Challenges from './components/Challenges';
import Forums from './components/Forums';
import { Sparkles } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <Sparkles className="w-5 h-5 text-emerald-400 absolute animate-pulse" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-4 font-semibold tracking-wide">
          Syncing environmental context...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'analytics':
        return <Analytics />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'marketplace':
        return <Marketplace />;
      case 'challenges':
        return <Challenges />;
      case 'chat':
        return <ChatAdvisor />;
      case 'profile':
        return <Profile />;
      case 'forums':
        return <Forums />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex bg-emerald-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar Navigation */}
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      {/* Main Content Pane */}
      <main className="flex-1 min-w-0 pl-20 md:pl-64 transition-all duration-300">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
