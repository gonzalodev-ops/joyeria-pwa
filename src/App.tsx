import { useState, useEffect } from 'react';
import { StudioView } from './views/StudioView';
import { Gallery } from './components/Gallery';
import { CatalogManager } from './components/CatalogManager';
import { SettingsModal } from './components/SettingsModal';
import { SettingsProvider } from './contexts/SettingsContext';
import { useTheme } from './contexts/ThemeContext';
import { getCatalogs, getImages } from './services/database';
import { InstallPrompt } from './components/InstallPrompt';
import { MaterialIcon, StatsCard } from './components/ui';

function AppContent() {
  const { theme } = useTheme();

  const [activeTab, setActiveTab] = useState<'studio' | 'gallery' | 'catalogs'>('studio');
  const [showSettings, setShowSettings] = useState(false);
  const [stats, setStats] = useState({ processed: 0, catalogs: 0 });

  // Load stats
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [images, catalogs] = await Promise.all([
        getImages(),
        getCatalogs()
      ]);
      setStats({
        processed: images.length,
        catalogs: catalogs.length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleNavigate = (tab: 'gallery' | 'catalogs') => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'gallery':
        return <Gallery />;
      case 'catalogs':
        return <CatalogManager />;
      case 'studio':
      default:
        return <StudioView onNavigate={handleNavigate} onStatsUpdate={loadStats} />;
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'gallery':
        return 'Galería de Joyería';
      case 'catalogs':
        return 'Mis Catálogos';
      case 'studio':
      default:
        return 'Cargar Pieza de Joyería';
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-bronze-canvas-background font-display transition-colors duration-200">
      <InstallPrompt />

      {/* Sticky Header */}
      <header className="flex items-center p-4 pb-2 justify-between bg-bronze-canvas-background sticky top-0 z-10 border-b border-transparent transition-all duration-200">
        <div className="flex size-10 shrink-0 items-center justify-center">
          <button onClick={() => setActiveTab('studio')} className="text-bronze-canvas-primary-text">
            <MaterialIcon icon="menu" size={24} />
          </button>
        </div>
        <h1 className="flex-1 text-center text-lg font-bold leading-tight tracking-[-0.015em] text-bronze-canvas-primary-text">
          {getTitle()}
        </h1>
        <div className="flex size-10 shrink-0 items-center justify-center">
          <button onClick={() => setShowSettings(true)} className="text-bronze-canvas-primary-text">
            <MaterialIcon icon="settings" size={24} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col p-4">
        {renderContent()}

        {/* Stats Section - Only show on studio when no image selected */}
        {activeTab === 'studio' && (
          <div className="flex flex-wrap gap-4 mt-6">
            <StatsCard label="Piezas Procesadas" value={stats.processed} className="flex-1 min-w-[150px]" />
            <StatsCard label="Catálogos Creados" value={stats.catalogs} className="flex-1 min-w-[150px]" />
          </div>
        )}
      </main>

      {/* Navigation Footer */}
      {activeTab !== 'studio' && (
        <footer className="sticky bottom-0 bg-bronze-canvas-background/80 backdrop-blur-sm p-2 border-t border-bronze-canvas-border z-10">
          <div className="flex justify-around items-center">
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex flex-col items-center p-2 ${activeTab === 'studio' ? 'text-bronze-canvas-accent' : 'text-bronze-canvas-secondary-text'}`}
            >
              <MaterialIcon icon="upload_file" filled={activeTab === 'studio'} />
              <span className="text-[10px] font-bold mt-1">Cargar</span>
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex flex-col items-center p-2 ${activeTab === 'gallery' ? 'text-bronze-canvas-accent' : 'text-bronze-canvas-secondary-text'}`}
            >
              <MaterialIcon icon="photo_library" filled={activeTab === 'gallery'} />
              <span className="text-[10px] font-bold mt-1">Galería</span>
            </button>
            <button
              onClick={() => setActiveTab('catalogs')}
              className={`flex flex-col items-center p-2 ${activeTab === 'catalogs' ? 'text-bronze-canvas-accent' : 'text-bronze-canvas-secondary-text'}`}
            >
              <MaterialIcon icon="auto_stories" filled={activeTab === 'catalogs'} />
              <span className="text-[10px] font-bold mt-1">Catálogos</span>
            </button>
          </div>
        </footer>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

export default App;
