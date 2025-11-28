import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface AppSettings {
    logoUrl: string | null;
    brandColors: string[];
    defaultAspectRatio: '1:1' | '4:5' | '9:16';
}

interface SettingsContextType {
    settings: AppSettings;
    updateSettings: (newSettings: Partial<AppSettings>) => void;
    uploadLogo: (file: File) => Promise<void>;
}

const DEFAULT_SETTINGS: AppSettings = {
    logoUrl: null,
    brandColors: ['#FFFFFF', '#121212', '#F5F5F5', '#FAFAF5'], // Premium defaults
    defaultAspectRatio: '1:1',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<AppSettings>(() => {
        const saved = localStorage.getItem('jewelry_studio_settings');
        return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    });

    useEffect(() => {
        try {
            localStorage.setItem('jewelry_studio_settings', JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving settings to localStorage:', error);
            // Check if it's a quota exceeded error
            if (error instanceof DOMException && (
                error.name === 'QuotaExceededError' ||
                error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
                alert('El logo es demasiado grande para guardarse permanentemente. Por favor, usa una imagen más pequeña (menos de 2MB).');
            }
        }
    }, [settings]);

    const updateSettings = (newSettings: Partial<AppSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const uploadLogo = async (file: File) => {
        // Convert to Base64 to persist in localStorage
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            updateSettings({ logoUrl: base64String });
        };
        reader.readAsDataURL(file);
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, uploadLogo }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
