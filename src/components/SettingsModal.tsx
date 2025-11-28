import { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useTheme } from '../contexts/ThemeContext';
import type { ThemeName } from '../contexts/ThemeContext';
import { Button, MaterialIcon } from './ui';

interface SettingsModalProps {
    onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
    const { settings, updateSettings, uploadLogo } = useSettings();
    const { theme, setTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<'branding' | 'defaults' | 'theme'>('branding');

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            uploadLogo(file);
        }
    };

    const themes: { id: ThemeName; name: string; color: string }[] = [
        { id: 'bronze-canvas', name: 'Bronze Canvas', color: '#f0ede4' },
        { id: 'gold-cream', name: 'Gold Cream', color: '#fcfbf4' },
        { id: 'silver-blue', name: 'Silver Blue', color: '#f0f4f8' },
        { id: 'mauve-copper', name: 'Mauve Copper', color: '#fdf5f6' },
    ];

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-bronze-canvas-background border border-bronze-canvas-border rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="p-4 border-b border-bronze-canvas-border flex justify-between items-center bg-bronze-canvas-background">
                    <h3 className="text-lg font-bold text-bronze-canvas-primary-text flex items-center gap-2">
                        <MaterialIcon icon="settings" size={24} />
                        Configuración Global
                    </h3>
                    <button onClick={onClose} className="text-bronze-canvas-secondary-text hover:text-bronze-canvas-primary-text transition-colors">
                        <MaterialIcon icon="close" size={24} />
                    </button>
                </div>

                <div className="flex border-b border-bronze-canvas-border bg-bronze-canvas-component-bg">
                    <button
                        onClick={() => setActiveTab('branding')}
                        className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'branding' ? 'text-bronze-canvas-accent border-b-2 border-bronze-canvas-accent' : 'text-bronze-canvas-secondary-text hover:text-bronze-canvas-primary-text'}`}
                    >
                        Marca
                    </button>
                    <button
                        onClick={() => setActiveTab('defaults')}
                        className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'defaults' ? 'text-bronze-canvas-accent border-b-2 border-bronze-canvas-accent' : 'text-bronze-canvas-secondary-text hover:text-bronze-canvas-primary-text'}`}
                    >
                        Preferencias
                    </button>
                    <button
                        onClick={() => setActiveTab('theme')}
                        className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'theme' ? 'text-bronze-canvas-accent border-b-2 border-bronze-canvas-accent' : 'text-bronze-canvas-secondary-text hover:text-bronze-canvas-primary-text'}`}
                    >
                        Tema
                    </button>
                </div>

                <div className="p-6 space-y-6 bg-bronze-canvas-background min-h-[300px]">
                    {activeTab === 'branding' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            {/* Logo Upload */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-bronze-canvas-secondary-text uppercase tracking-wider">Logo de la Marca</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-xl bg-white border border-bronze-canvas-border flex items-center justify-center overflow-hidden relative group shadow-sm">
                                        {settings.logoUrl ? (
                                            <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <span className="text-xs text-bronze-canvas-secondary-text font-medium">Sin Logo</span>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                                            <button
                                                onClick={() => document.getElementById('settings-logo-upload')?.click()}
                                                className="text-white text-xs font-bold hover:underline"
                                            >
                                                Cambiar
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            id="settings-logo-upload"
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                        />
                                        <Button
                                            onClick={() => document.getElementById('settings-logo-upload')?.click()}
                                            variant="secondary"
                                            size="sm"
                                            icon="upload"
                                        >
                                            Subir Logo
                                        </Button>
                                        <p className="text-xs text-bronze-canvas-secondary-text mt-2 leading-relaxed">
                                            Se aplicará automáticamente en la esquina superior derecha de todas las imágenes.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Brand Colors */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-bronze-canvas-secondary-text uppercase tracking-wider">Colores de Marca</label>
                                <div className="grid grid-cols-4 gap-3">
                                    {settings.brandColors.map((color, index) => (
                                        <div key={index} className="space-y-1">
                                            <div
                                                className="w-full aspect-square rounded-lg border border-bronze-canvas-border shadow-sm relative group cursor-pointer hover:scale-105 transition-transform"
                                                style={{ backgroundColor: color }}
                                            >
                                                <input
                                                    type="color"
                                                    value={color}
                                                    onChange={(e) => {
                                                        const newColors = [...settings.brandColors];
                                                        newColors[index] = e.target.value;
                                                        updateSettings({ brandColors: newColors });
                                                    }}
                                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                />
                                            </div>
                                            <p className="text-[10px] text-bronze-canvas-secondary-text text-center uppercase font-mono">{color}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'defaults' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-bronze-canvas-secondary-text uppercase tracking-wider">Formato por Defecto</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {(['1:1', '4:5', '9:16'] as const).map((ratio) => (
                                        <button
                                            key={ratio}
                                            onClick={() => updateSettings({ defaultAspectRatio: ratio })}
                                            className={`py-2 px-3 rounded-lg text-sm font-bold border transition-all ${settings.defaultAspectRatio === ratio
                                                ? 'bg-bronze-canvas-accent border-bronze-canvas-accent text-white shadow-md'
                                                : 'bg-white border-bronze-canvas-border text-bronze-canvas-secondary-text hover:border-bronze-canvas-accent'
                                                }`}
                                        >
                                            {ratio}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-bronze-canvas-secondary-text mt-1">
                                    1:1 (Cuadrado) es ideal para catálogos y e-commerce.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'theme' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-bronze-canvas-secondary-text uppercase tracking-wider">Tema de la Aplicación</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {themes.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => setTheme(t.id)}
                                            className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${theme === t.id
                                                ? 'border-bronze-canvas-accent ring-1 ring-bronze-canvas-accent bg-bronze-canvas-component-bg'
                                                : 'border-bronze-canvas-border bg-white hover:border-bronze-canvas-accent/50'
                                                }`}
                                        >
                                            <div className="w-8 h-8 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: t.color }} />
                                            <span className={`text-sm font-medium ${theme === t.id ? 'text-bronze-canvas-primary-text' : 'text-bronze-canvas-secondary-text'}`}>
                                                {t.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-bronze-canvas-border bg-bronze-canvas-component-bg flex justify-end">
                    <Button
                        onClick={onClose}
                        icon="check"
                    >
                        Listo
                    </Button>
                </div>
            </div>
        </div>
    );
}
