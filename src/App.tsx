import { useState, useRef, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { CanvasEditor } from './components/CanvasEditor';
import type { CanvasEditorRef } from './components/CanvasEditor';
import { Gallery } from './components/Gallery';
import { CatalogManager } from './components/CatalogManager';
import { SaveModal } from './components/SaveModal';
import { SettingsModal } from './components/SettingsModal';
import { CatalogSelector } from './components/CatalogSelector';
import { SaveImageDialog } from './components/SaveImageDialog';
import { SettingsProvider } from './contexts/SettingsContext';
import { useToast } from './contexts/ToastContext';
import { useTheme } from './contexts/ThemeContext';
import { removeBackground } from './services/photoroom';
import { analyzeJewelryImage } from './services/gemini';
import type { JewelryMetadata } from './services/gemini';
import { uploadWithEnhancement, uploadDataURLToCloudinary } from './services/cloudinary';
import type { CloudinaryEnhancement } from './services/cloudinary';
import { saveImage, getCatalogs, addImageToCatalog, getImages } from './services/database';
import { InstallPrompt } from './components/InstallPrompt';

// New UI Components
import { Button, Card, StatsCard, MaterialIcon } from './components/ui';

function AppContent() {
  const { showToast } = useToast();
  const { theme } = useTheme();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<JewelryMetadata | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'studio' | 'gallery' | 'catalogs'>('studio');

  // Stats
  const [stats, setStats] = useState({ processed: 0, catalogs: 0 });

  // Modal states
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showCatalogSelector, setShowCatalogSelector] = useState(false);

  const canvasEditorRef = useRef<CanvasEditorRef>(null);

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

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setProcessedImage(null);
    setMetadata(null);
    // Auto process on select could be added here if desired
  };

  const handleProcessAll = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setIsAnalyzing(true);

    try {
      // 1. Remove Background
      const blob = await removeBackground(selectedImage);
      const url = URL.createObjectURL(blob);
      setProcessedImage(url);

      // 2. Analyze Image
      const originalUrl = URL.createObjectURL(selectedImage);
      const analysis = await analyzeJewelryImage(originalUrl);
      setMetadata(analysis);
      URL.revokeObjectURL(originalUrl);

    } catch (error) {
      console.error('Error in auto-process:', error);
      showToast('Error durante el procesamiento automático.', 'error');
    } finally {
      setIsProcessing(false);
      setIsAnalyzing(false);
    }
  };

  const initiateSave = () => {
    if (!canvasEditorRef.current || !processedImage) {
      showToast('Por favor procesa una imagen primero', 'warning');
      return;
    }

    if (!metadata) {
      // Create dummy metadata
      const dummyMetadata: JewelryMetadata = {
        title: '',
        category: 'Otro',
        material: '',
        description: '',
        keywords: [],
        lighting_analysis: 'No disponible',
        cloudinary_enhancements: { brightness: 0, contrast: 0, saturation: 0, auto_enhance: false }
      };
      setMetadata(dummyMetadata);
    }

    setShowSaveModal(true);
  };

  const handleSave = async (
    confirmedMetadata: JewelryMetadata,
    enhancements: CloudinaryEnhancement,
    destination: 'gallery' | 'catalog',
    catalogId?: string
  ) => {
    if (!canvasEditorRef.current) return;

    setShowSaveModal(false);
    setIsSaving(true);

    try {
      const dataURL = canvasEditorRef.current.getCanvasDataURL();
      if (!dataURL) throw new Error('Failed to get canvas data');

      const cloudinaryUrl = await uploadWithEnhancement(dataURL, enhancements);

      const savedImage = await saveImage({
        url: cloudinaryUrl,
        original_url: selectedImage ? URL.createObjectURL(selectedImage) : undefined,
        title: confirmedMetadata.title,
        category: confirmedMetadata.category,
        metadata: {
          material: confirmedMetadata.material,
          description: confirmedMetadata.description,
          keywords: confirmedMetadata.keywords,
          lighting_analysis: confirmedMetadata.lighting_analysis,
          enhancements_applied: enhancements,
          processedAt: new Date().toISOString(),
        },
      });

      if (destination === 'catalog' && catalogId && savedImage?.id) {
        await addImageToCatalog(catalogId, savedImage.id);
        showToast('Guardado en catálogo exitosamente', 'success');
        setActiveTab('catalogs');
      } else {
        showToast('Guardado en galería exitosamente', 'success');
        setActiveTab('gallery');
      }

      loadStats();
    } catch (error) {
      console.error('Error saving image:', error);
      showToast('Error al guardar la imagen', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSimpleSaveToGallery = async (metadata: { title: string; category: string; material?: string; description?: string }) => {
    if (!canvasEditorRef.current || !processedImage) return;

    setIsSaving(true);
    try {
      const dataURL = canvasEditorRef.current.getCanvasDataURL();
      if (!dataURL) throw new Error('Failed to get canvas data');

      const cloudinaryUrl = await uploadDataURLToCloudinary(dataURL);

      await saveImage({
        url: cloudinaryUrl,
        title: metadata.title,
        category: metadata.category,
        metadata: {
          material: metadata.material,
          description: metadata.description,
          processedAt: new Date().toISOString(),
        },
      });

      showToast('Guardado en galería exitosamente', 'success');
      loadStats();
      setActiveTab('gallery');
    } catch (error) {
      console.error('Error saving to gallery:', error);
      showToast('Error al guardar la imagen', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportToCatalog = async (catalogId: string) => {
    if (!canvasEditorRef.current || !processedImage) return;

    setIsSaving(true);
    setShowCatalogSelector(false);

    try {
      const dataURL = canvasEditorRef.current.getCanvasDataURL();
      if (!dataURL) throw new Error('Failed to get canvas data');

      const cloudinaryUrl = await uploadDataURLToCloudinary(dataURL);

      const savedImage = await saveImage({
        url: cloudinaryUrl,
        title: metadata?.title || 'Untitled',
        category: metadata?.category || 'Other',
        metadata: {
          material: metadata?.material,
          description: metadata?.description,
          processedAt: new Date().toISOString(),
        },
      });

      if (savedImage?.id) {
        await addImageToCatalog(catalogId, savedImage.id);
        showToast('Exportado al catálogo exitosamente', 'success');
        loadStats();
        setActiveTab('catalogs');
      }
    } catch (error) {
      console.error('Error exporting to catalog:', error);
      showToast('Error al exportar la imagen', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Render Content based on active tab
  const renderContent = () => {
    if (activeTab === 'gallery') return <Gallery />;
    if (activeTab === 'catalogs') return <CatalogManager />;

    // Studio / Upload Tab
    return (
      <div className="flex flex-col gap-6">
        {/* Upload Area */}
        {!selectedImage ? (
          <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-bronze-canvas-border px-6 py-14 flex-grow justify-center bg-bronze-canvas-background">
            <div className="flex justify-center items-center size-20 rounded-full bg-bronze-canvas-component-bg">
              <MaterialIcon icon="upload_file" size={40} className="text-bronze-canvas-secondary-text" />
            </div>
            <div className="flex max-w-[480px] flex-col items-center gap-2">
              <p className="text-bronze-canvas-primary-text text-lg font-bold leading-tight tracking-[-0.015em] text-center">
                Toca para seleccionar una imagen
              </p>
              <p className="text-bronze-canvas-secondary-text text-sm font-normal leading-normal text-center">
                Formatos soportados: JPG, PNG, WEBP. Máx 10MB
              </p>
            </div>
            <div className="w-full max-w-[480px]">
              <ImageUploader onImageSelect={handleImageSelect} className="border-none h-auto p-0" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Processing View */}
            <div className="bg-bronze-canvas-component-bg rounded-xl border border-bronze-canvas-border p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-bronze-canvas-primary-text">Estudio de Edición</h2>
                <Button variant="ghost" size="sm" onClick={() => setSelectedImage(null)} icon="close">
                  Cancelar
                </Button>
              </div>

              {processedImage ? (
                <CanvasEditor
                  ref={canvasEditorRef}
                  imageSrc={processedImage}
                  title={metadata?.title}
                  className="mb-4"
                />
              ) : (
                <div className="aspect-square w-full bg-bronze-canvas-background rounded-lg flex items-center justify-center mb-4">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Original"
                    className="max-h-full max-w-full object-contain opacity-50"
                  />
                </div>
              )}

              {!processedImage && (
                <div className="flex flex-col gap-3">
                  <Button
                    fullWidth
                    onClick={handleProcessAll}
                    loading={isProcessing || isAnalyzing}
                    icon="auto_awesome"
                  >
                    Procesar Imagen (AI)
                  </Button>
                </div>
              )}
            </div>

            {metadata && (
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <MaterialIcon icon="lightbulb" className="text-bronze-canvas-accent" />
                  <h3 className="font-bold text-bronze-canvas-primary-text">Análisis AI</h3>
                </div>
                <p className="text-sm text-bronze-canvas-primary-text font-medium">{metadata.title}</p>
                <p className="text-xs text-bronze-canvas-secondary-text mt-1">{metadata.description}</p>
              </Card>
            )}
          </div>
        )}

        {/* Stats Section - Only show on home/upload screen when no image selected */}
        {!selectedImage && (
          <div className="flex flex-wrap gap-4">
            <StatsCard label="Piezas Procesadas" value={stats.processed} className="flex-1 min-w-[150px]" />
            <StatsCard label="Catálogos Creados" value={stats.catalogs} className="flex-1 min-w-[150px]" />
          </div>
        )}
      </div>
    );
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
          {activeTab === 'studio' ? 'Cargar Pieza de Joyería' :
            activeTab === 'gallery' ? 'Galería de Joyería' : 'Mis Catálogos'}
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
      </main>

      {/* Sticky Footer - Only show actions when image is processed */}
      {selectedImage && processedImage && activeTab === 'studio' && (
        <footer className="sticky bottom-0 bg-bronze-canvas-background/80 backdrop-blur-sm p-4 pt-2 border-t border-bronze-canvas-border z-10">
          <div className="flex flex-1 gap-3 max-w-[480px] flex-col items-stretch mx-auto">
            <Button
              fullWidth
              variant="primary"
              size="lg"
              onClick={() => setShowCatalogSelector(true)}
              disabled={isSaving}
              icon="auto_stories"
            >
              Exportar a Catálogo
            </Button>
            <Button
              fullWidth
              variant="secondary"
              size="lg"
              onClick={() => setShowSaveDialog(true)}
              disabled={isSaving}
              icon="photo_library"
            >
              Guardar en Galería
            </Button>
          </div>
        </footer>
      )}

      {/* Navigation Footer (if no image selected) - Optional, to switch tabs */}
      {!selectedImage && (
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

      {/* Modals */}
      {showSaveModal && metadata && canvasEditorRef.current && (
        <SaveModal
          metadata={metadata}
          previewUrl={canvasEditorRef.current.getCanvasDataURL() || ''}
          onSave={handleSave}
          onCancel={() => setShowSaveModal(false)}
        />
      )}

      <SaveImageDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleSimpleSaveToGallery}
      />

      <CatalogSelector
        isOpen={showCatalogSelector}
        onClose={() => setShowCatalogSelector(false)}
        onSelect={handleExportToCatalog}
      />

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
