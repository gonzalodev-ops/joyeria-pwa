import type { ReactNode } from 'react';
import { MaterialIcon } from './ui';
import { BottomNavigation } from './BottomNavigation';

interface LayoutProps {
    children: ReactNode;
    activeTab: 'studio' | 'gallery' | 'catalogs';
    onNavigate: (tab: 'studio' | 'gallery' | 'catalogs') => void;
    onOpenSettings: () => void;
    title: string;
}

export function Layout({
    children,
    activeTab,
    onNavigate,
    onOpenSettings,
    title
}: LayoutProps) {
    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-bronze-canvas-background font-display transition-colors duration-200">
            {/* Sticky Header */}
            <header className="flex items-center p-4 pb-2 justify-between bg-bronze-canvas-background sticky top-0 z-10 border-b border-transparent transition-all duration-200">
                <div className="flex size-10 shrink-0 items-center justify-center">
                    {activeTab !== 'studio' && (
                        <button onClick={() => onNavigate('studio')} className="text-bronze-canvas-primary-text">
                            <MaterialIcon icon="arrow_back" size={24} />
                        </button>
                    )}
                    {activeTab === 'studio' && (
                        <button className="text-bronze-canvas-primary-text opacity-50 cursor-default">
                            <MaterialIcon icon="menu" size={24} />
                        </button>
                    )}
                </div>
                <h1 className="flex-1 text-center text-lg font-bold leading-tight tracking-[-0.015em] text-bronze-canvas-primary-text">
                    {title}
                </h1>
                <div className="flex size-10 shrink-0 items-center justify-center">
                    <button onClick={onOpenSettings} className="text-bronze-canvas-primary-text">
                        <MaterialIcon icon="settings" size={24} />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex flex-col p-4">
                {children}
            </main>

            {/* Navigation Footer - Only show if not in studio (or maybe always? user preference, keeping logic same as before for now) */}
            {activeTab !== 'studio' && (
                <BottomNavigation activeTab={activeTab} onNavigate={onNavigate} />
            )}
        </div>
    );
}
