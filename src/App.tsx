import { useState, Suspense, lazy } from 'react';
import { SettingsModal } from './components/SettingsModal';
import { SettingsProvider } from './contexts/SettingsContext';
import { InstallPrompt } from './components/InstallPrompt';
import { StatsCard, MaterialIcon } from './components/ui';
import { Layout } from './components/Layout';
import { useAppStats } from './hooks/useAppStats';

// Lazy load views for better performance
const StudioView = lazy(() => import('./views/StudioView').then(module => ({ default: module.StudioView })));
const Gallery = lazy(() => import('./components/Gallery').then(module => ({ default: module.Gallery })));
const CatalogManager = lazy(() => import('./components/CatalogManager').then(module => ({ default: module.CatalogManager })));

function AppContent() {
  const [activeTab, setActiveTab] = useState<'studio' | 'gallery' | 'catalogs'>('studio');
  const [showSettings, setShowSettings] = useState(false);
  const { stats, refreshStats } = useAppStats();

  const handleNavigate = (tab: 'studio' | 'gallery' | 'catalogs') => {
    setActiveTab(tab);
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
    <Layout
      activeTab={activeTab}
      onNavigate={handleNavigate}
      onOpenSettings={() => setShowSettings(true)}
      title={getTitle()}
    >
      <InstallPrompt />

      <Suspense fallback={
        <div className="flex h-64 w-full items-center justify-center">
          <MaterialIcon icon="progress_activity" className="animate-spin text-bronze-canvas-accent" size={48} />
        </div>
      }>
        {activeTab === 'studio' && (
          <>
            <StudioView onNavigate={(tab) => handleNavigate(tab as any)} onStatsUpdate={refreshStats} />
            <div className="flex flex-wrap gap-4 mt-6">
              <StatsCard label="Piezas Procesadas" value={stats.processed} className="flex-1 min-w-[150px]" />
              <StatsCard label="Catálogos Creados" value={stats.catalogs} className="flex-1 min-w-[150px]" />
            </div>
          </>
        )}
        {activeTab === 'gallery' && <Gallery />}
        {activeTab === 'catalogs' && <CatalogManager />}
      </Suspense>

      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </Layout>
  );
}

import { EditorProvider } from './contexts/EditorContext';

function App() {
  return (
    <SettingsProvider>
      <EditorProvider>
        <AppContent />
      </EditorProvider>
    </SettingsProvider>
  );
}

export default App;
