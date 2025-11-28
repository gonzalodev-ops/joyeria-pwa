import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeName = 'bronze-canvas' | 'gold-cream' | 'silver-blue' | 'mauve-copper';

interface ThemeColors {
    background: string;
    primaryText: string;
    secondaryText: string;
    componentBg: string;
    accent: string;
    border: string;
}

interface ThemeContextType {
    theme: ThemeName;
    setTheme: (theme: ThemeName) => void;
    colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themeColors: Record<ThemeName, ThemeColors> = {
    'bronze-canvas': {
        background: '#f0ede4',
        primaryText: '#1a362a',
        secondaryText: '#5a6b5a',
        componentBg: '#e6e0d3',
        accent: '#a6886e',
        border: '#c9c2b6',
    },
    'gold-cream': {
        background: '#faf8f3',
        primaryText: '#2d2416',
        secondaryText: '#6b5d4f',
        componentBg: '#f5f0e8',
        accent: '#d4a574',
        border: '#e8dcc8',
    },
    'silver-blue': {
        background: '#f0f4f8',
        primaryText: '#1a2332',
        secondaryText: '#4a5568',
        componentBg: '#e2e8f0',
        accent: '#94a3b8',
        border: '#cbd5e1',
    },
    'mauve-copper': {
        background: '#f5f0f3',
        primaryText: '#2d1a28',
        secondaryText: '#6b5563',
        componentBg: '#ebe3e8',
        accent: '#b8856a',
        border: '#d9c9d3',
    },
};

const themeNames: Record<ThemeName, string> = {
    'bronze-canvas': 'Bronze Canvas',
    'gold-cream': 'Gold Cream',
    'silver-blue': 'Silver Blue',
    'mauve-copper': 'Mauve Copper',
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<ThemeName>(() => {
        const saved = localStorage.getItem('jewelry-theme');
        return (saved as ThemeName) || 'bronze-canvas';
    });

    useEffect(() => {
        localStorage.setItem('jewelry-theme', theme);

        // Update CSS custom properties for the current theme
        const root = document.documentElement;
        const colors = themeColors[theme];

        root.style.setProperty('--color-background', colors.background);
        root.style.setProperty('--color-primary-text', colors.primaryText);
        root.style.setProperty('--color-secondary-text', colors.secondaryText);
        root.style.setProperty('--color-component-bg', colors.componentBg);
        root.style.setProperty('--color-accent', colors.accent);
        root.style.setProperty('--color-border', colors.border);
    }, [theme]);

    const setTheme = (newTheme: ThemeName) => {
        setThemeState(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, colors: themeColors[theme] }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export { themeColors, themeNames };
export type { ThemeColors };
