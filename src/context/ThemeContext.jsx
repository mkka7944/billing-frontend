import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext();

/**
 * SURFACE_PALETTES: Defines the background "DNA" of the app.
 */
const SURFACE_PALETTES = {
    antigravity: {
        name: 'Antigravity Pro',
        light: { background: '0 0% 100%', secondary: '240 4.8% 95.9%', card: '0 0% 100%', border: '240 5.9% 100%' },
        dark: { background: '240 5% 10%', secondary: '240 5% 7%', card: '240 5% 14%', border: '240 5% 18%' }
    },
    cloud: {
        name: 'Cloud Paper', // Ultra-clean light mode
        light: { background: '0 0% 100%', secondary: '210 20% 98%', card: '0 0% 100%', border: '210 20% 90%' },
        dark: { background: '210 20% 4%', secondary: '210 20% 2%', card: '210 20% 6%', border: '210 10% 12%' }
    },
    ivory: {
        name: 'Soft Ivory', // Warm-toned light mode
        light: { background: '45 20% 99%', secondary: '45 15% 96%', card: '0 0% 100%', border: '45 10% 90%' },
        dark: { background: '45 10% 4%', secondary: '45 10% 2%', card: '45 10% 6%', border: '45 5% 12%' }
    },
    zinc: {
        name: 'Industrial Zinc',
        light: { background: '0 0% 100%', secondary: '240 4.8% 95.9%', card: '0 0% 100%', border: '240 5.9% 90%' },
        dark: { background: '240 10% 4%', secondary: '240 10% 2%', card: '240 10% 6%', border: '240 5% 12%' }
    },
    obsidian: {
        name: 'Onyx Void',
        light: { background: '0 0% 100%', secondary: '240 4.8% 95.9%', card: '0 0% 100%', border: '240 5.9% 90%' },
        dark: { background: '0 0% 0%', secondary: '0 0% 5%', card: '0 0% 8%', border: '0 0% 12%' }
    },
    emerald: {
        name: 'Himalayan Ridge',
        light: { background: '142.1 40% 99%', secondary: '142.1 30% 96%', card: '0 0% 100%', border: '142.1 30% 92%' },
        dark: { background: '142.1 60% 3%', secondary: '142.1 50% 8%', card: '142.1 40% 5%', border: '142.1 50% 10%' }
    }
};

/**
 * ACCENT_COLORS: Defines Buttons, Tints, and highlights.
 */
const ACCENT_COLORS = {
    indigo: {
        name: 'Quantum Indigo',
        light: { primary: '239 84% 67%', foreground: '0 0% 100%' },
        dark: { primary: '239 84% 67%', foreground: '0 0% 100%' }
    },
    sky: {
        name: 'Sky Blue',
        light: { primary: '199 89% 48%', foreground: '0 0% 100%' },
        dark: { primary: '199 89% 48%', foreground: '0 0% 100%' }
    },
    emerald: {
        name: 'Bio-Green',
        light: { primary: '142 71% 45%', foreground: '0 0% 100%' },
        dark: { primary: '142 71% 45%', foreground: '0 0% 100%' }
    },
    rose: {
        name: 'Cyber Rose',
        light: { primary: '347 77% 50%', foreground: '0 0% 100%' },
        dark: { primary: '347 77% 50%', foreground: '0 0% 100%' }
    },
    amber: {
        name: 'Atomic Amber',
        light: { primary: '38 92% 50%', foreground: '0 0% 100%' },
        dark: { primary: '38 92% 50%', foreground: '38 92% 5%' }
    },
    steel: {
        name: 'Steel Grey', // New Neutral Gray
        light: { primary: '210 10% 40%', foreground: '0 0% 100%' },
        dark: { primary: '210 10% 60%', foreground: '210 10% 10%' }
    },
    slate_grey: {
        name: 'Cool Slate', // New Blue-ish Gray
        light: { primary: '215 15% 45%', foreground: '0 0% 100%' },
        dark: { primary: '215 20% 65%', foreground: '215 20% 10%' }
    },
    graphite: {
        name: 'Lead Graphite', // New Dark Gray
        light: { primary: '240 6% 25%', foreground: '0 0% 98%' },
        dark: { primary: '240 6% 45%', foreground: '240 6% 5%' }
    },
    zinc: {
        name: 'Basic Lead',
        light: { primary: '240 6% 10%', foreground: '0 0% 98%' },
        dark: { primary: '0 0% 98%', foreground: '240 6% 10%' }
    }
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
    const [surfacePalette, setSurfacePalette] = useState(() => localStorage.getItem('surfacePalette') || 'antigravity');
    const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accentColor') || 'indigo');

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.add('theme-transitioning');
        root.classList.remove('dark', 'light');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
        setTimeout(() => root.classList.remove('theme-transitioning'), 300);
    }, [theme]);

    useEffect(() => {
        const root = window.document.documentElement;

        // 1. Surface Variables
        const palette = SURFACE_PALETTES[surfacePalette] || SURFACE_PALETTES.antigravity;
        const sSet = theme === 'dark' ? palette.dark : palette.light;

        root.style.setProperty('--background', sSet.background);
        root.style.setProperty('--secondary', sSet.secondary);
        root.style.setProperty('--card', sSet.card);
        root.style.setProperty('--border', sSet.border);
        root.style.setProperty('--muted', sSet.secondary);
        root.style.setProperty('--accent', sSet.secondary);

        // 2. Accent Variables
        const accent = ACCENT_COLORS[accentColor] || ACCENT_COLORS.indigo;
        const aSet = theme === 'dark' ? accent.dark : accent.light;

        root.style.setProperty('--primary', aSet.primary);
        root.style.setProperty('--ring', aSet.primary);
        root.style.setProperty('--primary-foreground', aSet.foreground);

        localStorage.setItem('surfacePalette', surfacePalette);
        localStorage.setItem('accentColor', accentColor);
    }, [theme, surfacePalette, accentColor]);

    return (
        <ThemeContext.Provider value={{
            theme, toggleTheme: () => setTheme(v => v === 'light' ? 'dark' : 'light'), setTargetTheme: setTheme,
            surfacePalette, setSurfacePalette, palettes: SURFACE_PALETTES,
            accentColor, setAccentColor, accents: ACCENT_COLORS
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
