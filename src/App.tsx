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
import { Sparkles, Image as ImageIcon, Layers, Loader2, Lightbulb, Settings, Wand2 } from 'lucide-react';
import { removeBackground } from './services/photoroom';
import { analyzeJewelryImage } from './services/gemini';
import type { JewelryMetadata } from './services/gemini';
import { uploadWithEnhancement, uploadDataURLToCloudinary } from './services/cloudinary';
import type { CloudinaryEnhancement } from './services/cloudinary';
import { saveImage, getCatalogs, addImageToCatalog, getImages } from './services/database';
import { InstallPrompt } from './components/InstallPrompt';

function AppContent() {
  const { showToast } = useToast();
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

  // Debug: Monitor metadata changes
  useEffect(() => {
    console.log('DEBUG: Metadata state updated:', metadata);
  }, [metadata]);

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
    console.log('Selected image:', file.name);
  };

  const handleProcessAll = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setIsAnalyzing(true);

    try {
      // 1. Remove Background
      console.log('Starting auto-process: Removing background...');
      const blob = await removeBackground(selectedImage);
      const url = URL.createObjectURL(blob);
      setProcessedImage(url);

      // 2. Analyze Image
      console.log('Starting auto-process: Analyzing image...');
      const originalUrl = URL.createObjectURL(selectedImage);
      const analysis = await analyzeJewelryImage(originalUrl);
      setMetadata(analysis);
      URL.revokeObjectURL(originalUrl);

    } catch (error) {
      console.error('Error in auto-process:', error);
      showToast('Error durante el procesamiento automático. Verifica tu conexión.', 'error');
    } finally {
      setIsProcessing(false);
      setIsAnalyzing(false);
    }
  };

  const handleRemoveBackground = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    try {
      const blob = await removeBackground(selectedImage);
      const url = URL.createObjectURL(blob);
      setProcessedImage(url);
    } catch (error) {
      console.error('Error removing background:', error);
      alert('Failed to remove background. Please checks your API key.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnalyzeLighting = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    try {
      const imageUrl = URL.createObjectURL(selectedImage);
      const result = await analyzeJewelryImage(imageUrl);
      console.log('DEBUG: Gemini analysis result:', result);

      if (!result) {
        throw new Error('Analysis returned empty result');
      }

      setMetadata(result);
    } catch (error) {
      console.error('Error analyzing image:', error);
      alert('Failed to analyze image.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const initiateSave = () => {
    if (!canvasEditorRef.current || !processedImage) {
      showToast('Por favor procesa una imagen primero', 'warning');
      return;
    }

    if (!metadata) {
      const proceed = confirm('No se ha generado metadata con IA. ¿Deseas guardar la imagen de todos modos?');
      if (!proceed) return;

      // Create dummy metadata to allow manual entry
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

      // Upload to Cloudinary with enhancements
      const cloudinaryUrl = await uploadWithEnhancement(dataURL, enhancements);

      // Save image to database
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

      // If destination is catalog, add to catalog
      if (destination === 'catalog' && catalogId && savedImage?.id) {
        await addImageToCatalog(catalogId, savedImage.id);
        showToast('Imagen guardada y agregada al catálogo exitosamente!', 'success');
        setActiveTab('catalogs');
      } else {
        showToast('Imagen guardada en galería exitosamente!', 'success');
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

  // Simple save to gallery (without full metadata flow)
  const handleSimpleSaveToGallery = async (metadata: { title: string; category: string; material?: string; description?: string }) => {
    if (!canvasEditorRef.current || !processedImage) return;

    setIsSaving(true);
    try {
      const dataURL = canvasEditorRef.current.getCanvasDataURL();
      if (!dataURL) throw new Error('Failed to get canvas data');

      // Upload to Cloudinary
      const cloudinaryUrl = await uploadDataURLToCloudinary(dataURL);

      // Save to database
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

      showToast('Imagen guardada en galería exitosamente!', 'success');
      loadStats();
      setActiveTab('gallery');
    } catch (error) {
      console.error('Error saving to gallery:', error);
      showToast('Error al guardar la imagen', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Export to catalog
  const handleExportToCatalog = async (catalogId: string) => {
    if (!canvasEditorRef.current || !processedImage) return;

    setIsSaving(true);
    setShowCatalogSelector(false);

    try {
      const dataURL = canvasEditorRef.current.getCanvasDataURL();
      if (!dataURL) throw new Error('Failed to get canvas data');

      // Upload to Cloudinary
      const cloudinaryUrl = await uploadDataURLToCloudinary(dataURL);

      // Save image to database
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

      // Add to catalog
      if (savedImage?.id) {
        await addImageToCatalog(catalogId, savedImage.id);
        showToast('Imagen exportada al catálogo exitosamente!', 'success');
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


  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-500/30">
      <InstallPrompt />
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-[100000]">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">Jewelry AI Studio</h1>
          </div>
          <nav className="flex items-center gap-4 md:gap-6 text-sm font-medium text-zinc-400">
            <button
              onClick={() => setActiveTab('studio')}
              className={`transition-colors ${activeTab === 'studio' ? 'text-white' : 'hover:text-white'}`}
            >
              Studio
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`transition-colors ${activeTab === 'gallery' ? 'text-white' : 'hover:text-white'}`}
            >
              Gallery
            </button>
            <button
              onClick={() => setActiveTab('catalogs')}
              className={`transition-colors ${activeTab === 'catalogs' ? 'text-white' : 'hover:text-white'}`}
            >
              Catalogs
            </button>
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(true)}
              className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
            >
              <Settings size={16} />
            </button>
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700"></div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === 'gallery' ? (
          <Gallery />
        ) : activeTab === 'catalogs' ? (
          <CatalogManager />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Workspace */}
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <ImageIcon size={20} className="text-blue-400" />
                  Source Image
                </h2>
                <ImageUploader onImageSelect={handleImageSelect} />
              </section>

              {selectedImage && (
                <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Layers size={20} className="text-purple-400" />
                    Processing Pipeline
                  </h2>

                  <div className="space-y-4">
                    {/* Process All Button */}
                    <div className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl border border-blue-500/30 flex items-center justify-between group hover:border-blue-500/50 transition-all cursor-pointer shadow-lg shadow-blue-900/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-md">
                          <Sparkles size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-zinc-100">Procesamiento Automático</h3>
                          <p className="text-xs text-zinc-400">Eliminar fondo + Analizar con IA</p>
                        </div>
                      </div>
                      <button
                        onClick={handleProcessAll}
                        disabled={isProcessing || isAnalyzing}
                        className="px-4 py-2 text-sm font-bold bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                      >
                        {(isProcessing || isAnalyzing) ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            <Wand2 size={16} />
                            ✨ Procesar Todo
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-4 py-2">
                      <div className="h-px flex-1 bg-zinc-800"></div>
                      <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">O pasos individuales</span>
                      <div className="h-px flex-1 bg-zinc-800"></div>
                    </div>

                    <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50 flex items-center justify-between group hover:border-zinc-700 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                          <Layers size={20} />
                        </div>
                        <div>
                          <h3 className="font-medium">Remove Background</h3>
                          <p className="text-xs text-zinc-500">Using PhotoRoom AI</p>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveBackground}
                        disabled={isProcessing}
                        className="px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Process'
                        )}
                      </button>
                    </div>

                    <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50 flex items-center justify-between group hover:border-zinc-700 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                          <Sparkles size={20} />
                        </div>
                        <div>
                          <h3 className="font-medium">Enhance Lighting & Metadata</h3>
                          <p className="text-xs text-zinc-500">Using Gemini 2.5 Flash</p>
                        </div>
                      </div>
                      <button
                        onClick={handleAnalyzeLighting}
                        disabled={isAnalyzing}
                        className="px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          'Analyze'
                        )}
                      </button>
                    </div>
                  </div>

                  {metadata && (
                    <div className="mt-6 pt-6 border-t border-zinc-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <h3 className="font-semibold mb-4 text-zinc-200 flex items-center gap-2">
                        <Lightbulb size={18} className="text-yellow-400" />
                        AI Analysis
                      </h3>
                      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-sm text-yellow-200/90 leading-relaxed">
                        <p className="font-medium mb-2">{metadata.title}</p>
                        <p className="mb-2">{metadata.description}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {metadata.keywords.map((k, i) => (
                            <span key={i} className="px-2 py-0.5 bg-yellow-500/20 rounded text-xs">{k}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {processedImage && (
                    <div className="mt-6 pt-6 border-t border-zinc-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <h3 className="font-semibold mb-4 text-zinc-200">Result & Composition</h3>
                      <CanvasEditor
                        ref={canvasEditorRef}
                        imageSrc={processedImage}
                        title={metadata?.title}
                      />
                    </div>
                  )}
                </section>
              )}
            </div>

            {/* Sidebar / Tools */}
            <div className="space-y-6">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 sticky top-24">
                <h3 className="font-semibold mb-4 text-zinc-200">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={initiateSave}
                    disabled={!processedImage || isSaving}
                    className="w-full flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-medium transition-colors text-left"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                    Guardar Imagen
                  </button>
                  <button
                    onClick={() => setShowSaveDialog(true)}
                    disabled={!processedImage || isSaving}
                    className="w-full flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-medium transition-colors text-left"
                  >
                    <ImageIcon size={16} />
                    Guardar en Galería
                  </button>
                  <button
                    onClick={() => setShowCatalogSelector(true)}
                    disabled={!processedImage || isSaving}
                    className="w-full flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-medium transition-colors text-left"
                  >
                    <Layers size={16} />
                    Exportar a Catálogo
                  </button>
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-800">
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Estadísticas del Proyecto</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-950/50 p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-white">{stats.processed}</div>
                      <div className="text-[10px] text-zinc-500">PROCESADAS</div>
                    </div>
                    <div className="bg-zinc-950/50 p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-white">{stats.catalogs}</div>
                      <div className="text-[10px] text-zinc-500">CATÁLOGOS</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

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
