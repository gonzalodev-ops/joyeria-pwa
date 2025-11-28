import { useState } from 'react';
import { X, Upload, Check, Settings as SettingsIcon } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface SettingsModalProps {
    onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
    const { settings, updateSettings, uploadLogo } = useSettings();
    const [activeTab, setActiveTab] = useState<'branding' | 'defaults'>('branding');

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            uploadLogo(file);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                        <SettingsIcon size={20} className="text-zinc-400" />
                        Configuración Global
                    </h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex border-b border-zinc-800">
                    <button
                        onClick={() => setActiveTab('branding')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'branding' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Marca & Logo
                    </button>
                    <button
                        onClick={() => setActiveTab('defaults')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'defaults' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Preferencias
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {activeTab === 'branding' && (
                        <div className="space-y-6">
                            {/* Logo Upload */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Logo de la Marca</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden relative group">
                                        {settings.logoUrl ? (
                                            <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <span className="text-xs text-zinc-600">Sin Logo</span>
                                        )}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                onClick={() => document.getElementById('settings-logo-upload')?.click()}
                                                className="text-white text-xs font-medium hover:underline"
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
                                        <button
                                            onClick={() => document.getElementById('settings-logo-upload')?.click()}
                                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                        >
                                            <Upload size={16} />
                                            Subir Logo
                                        </button>
                                        <p className="text-xs text-zinc-500 mt-2">
                                            Se aplicará automáticamente en la esquina superior derecha de todas las imágenes.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Brand Colors */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Colores de Marca (Premium)</label>
                                <div className="grid grid-cols-4 gap-3">
                                    {settings.brandColors.map((color, index) => (
                                        <div key={index} className="space-y-1">
                                            <div
                                                className="w-full aspect-square rounded-lg border border-zinc-700 shadow-sm relative group cursor-pointer"
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
                                            <p className="text-[10px] text-zinc-500 text-center uppercase">{color}</p>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">
                                    Estos colores aparecerán como opciones rápidas en el editor.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'defaults' && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Formato por Defecto</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {(['1:1', '4:5', '9:16'] as const).map((ratio) => (
                                        <button
                                            key={ratio}
                                            onClick={() => updateSettings({ defaultAspectRatio: ratio })}
                                            className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${settings.defaultAspectRatio === ratio
                                                    ? 'bg-blue-600 border-blue-500 text-white'
                                                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                                }`}
                                        >
                                            {ratio}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">
                                    1:1 (Cuadrado) es ideal para catálogos y e-commerce.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <Check size={16} />
                        Listo
                    </button>
                </div>
            </div>
        </div>
    );
}
