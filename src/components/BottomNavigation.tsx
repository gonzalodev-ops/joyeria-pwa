import { MaterialIcon } from './ui';

interface BottomNavigationProps {
    activeTab: 'studio' | 'gallery' | 'catalogs';
    onNavigate: (tab: 'studio' | 'gallery' | 'catalogs') => void;
}

export function BottomNavigation({ activeTab, onNavigate }: BottomNavigationProps) {
    return (
        <footer className="sticky bottom-0 bg-bronze-canvas-background/80 backdrop-blur-sm p-2 border-t border-bronze-canvas-border z-10">
            <div className="flex justify-around items-center">
                <button
                    onClick={() => onNavigate('studio')}
                    className={`flex flex-col items-center p-2 ${activeTab === 'studio' ? 'text-bronze-canvas-accent' : 'text-bronze-canvas-secondary-text'}`}
                >
                    <MaterialIcon icon="upload_file" filled={activeTab === 'studio'} />
                    <span className="text-[10px] font-bold mt-1">Cargar</span>
                </button>
                <button
                    onClick={() => onNavigate('gallery')}
                    className={`flex flex-col items-center p-2 ${activeTab === 'gallery' ? 'text-bronze-canvas-accent' : 'text-bronze-canvas-secondary-text'}`}
                >
                    <MaterialIcon icon="photo_library" filled={activeTab === 'gallery'} />
                    <span className="text-[10px] font-bold mt-1">Galería</span>
                </button>
                <button
                    onClick={() => onNavigate('catalogs')}
                    className={`flex flex-col items-center p-2 ${activeTab === 'catalogs' ? 'text-bronze-canvas-accent' : 'text-bronze-canvas-secondary-text'}`}
                >
                    <MaterialIcon icon="auto_stories" filled={activeTab === 'catalogs'} />
                    <span className="text-[10px] font-bold mt-1">Catálogos</span>
                </button>
            </div>
        </footer>
    );
}
