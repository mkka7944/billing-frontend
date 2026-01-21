import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext();

/**
 * SURFACE_PALETTES: Defines the background "DNA" of the app.
 */
const SURFACE_PALETTES = {
    antigravity: {
        name: 'Antigravity Pro', // DEEP DARK
        light: { background: '240 5% 98%', secondary: '240 5% 94%', card: '0 0% 100%', border: '240 6% 90%' },
        dark: { background: '240 5% 8%', secondary: '240 5% 5%', card: '240 5% 12%', border: '240 5% 16%' }
    },
    github: {
        name: 'GitHub Dark', // DEEP DARK
        light: { background: '210 20% 98%', secondary: '210 20% 95%', card: '0 0% 100%', border: '210 20% 88%' },
        dark: { background: '222 13% 6%', secondary: '222 13% 4%', card: '222 13% 9%', border: '210 12% 18%' }
    },
    mocha: {
        name: 'Catppuccin Mocha', // DEEP WARM DARK
        light: { background: '30 15% 97%', secondary: '30 15% 92%', card: '0 0% 100%', border: '30 10% 85%' },
        dark: { background: '240 21% 12%', secondary: '240 21% 15%', card: '240 21% 18%', border: '240 21% 25%' }
    },
    cloud: {
        name: 'Lighter Cloud', // LIGHT DARK TONE
        light: { background: '210 20% 99%', secondary: '210 20% 94%', card: '0 0% 100%', border: '210 20% 88%' },
        dark: { background: '210 10% 22%', secondary: '210 10% 18%', card: '210 10% 26%', border: '210 10% 32%' }
    },
    ivory: {
        name: 'Soft Ivory', // LIGHT DARK TONE
        light: { background: '45 20% 98%', secondary: '45 15% 93%', card: '0 0% 100%', border: '45 10% 86%' },
        dark: { background: '45 5% 22%', secondary: '45 5% 18%', card: '45 5% 26%', border: '45 5% 32%' }
    },
    zinc: {
        name: 'Industrial Zinc', // LIGHT DARK TONE
        light: { background: '240 5% 99%', secondary: '240 5% 92%', card: '0 0% 100%', border: '240 5% 86%' },
        dark: { background: '240 4% 20%', secondary: '240 4% 16%', card: '240 4% 24%', border: '240 4% 30%' }
    },
    obsidian: {
        name: 'Graphite Slate', // LIGHT DARK TONE (Used to be Onyx Void)
        light: { background: '0 0% 100%', secondary: '0 0% 96%', card: '0 0% 100%', border: '0 0% 90%' },
        dark: { background: '240 4% 16%', secondary: '240 4% 12%', card: '240 4% 20%', border: '240 4% 26%' }
    },
    emerald: {
        name: 'Himalayan Ridge', // LIGHT DARK TONE
        light: { background: '142.1 40% 98%', secondary: '142.1 30% 93%', card: '0 0% 100%', border: '142.1 30% 88%' },
        dark: { background: '142.1 20% 20%', secondary: '142.1 20% 16%', card: '142.1 20% 24%', border: '142.1 20% 30%' }
    },
    supabase: {
        name: 'Supabase Studio',
        light: { background: '0 0% 100%', secondary: '154 6% 96%', card: '0 0% 100%', border: '154 6% 90%' },
        dark: { background: '160 2% 9%', secondary: '160 2% 12%', card: '160 2% 15%', border: '160 2% 20%' }
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
    github_blue: {
        name: 'GitHub Blue',
        light: { primary: '212 92% 45%', foreground: '0 0% 100%' },
        dark: { primary: '212 92% 45%', foreground: '0 0% 100%' }
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
        name: 'Steel Grey',
        light: { primary: '210 10% 40%', foreground: '0 0% 100%' },
        dark: { primary: '210 10% 60%', foreground: '210 10% 10%' }
    },
    slate_grey: {
        name: 'Cool Slate',
        light: { primary: '215 15% 45%', foreground: '0 0% 100%' },
        dark: { primary: '215 20% 65%', foreground: '215 20% 10%' }
    },
    graphite: {
        name: 'Lead Graphite',
        light: { primary: '240 6% 25%', foreground: '0 0% 98%' },
        dark: { primary: '240 6% 45%', foreground: '240 6% 5%' }
    },
    zinc: {
        name: 'Basic Lead',
        light: { primary: '240 6% 10%', foreground: '0 0% 98%' },
        dark: { primary: '0 0% 98%', foreground: '240 6% 10%' }
    },
    supabase_emerald: {
        name: 'Supabase Emerald',
        light: { primary: '153 60% 53%', foreground: '0 0% 0%' },
        dark: { primary: '153 60% 53%', foreground: '0 0% 0%' }
    }
};

/**
 * FONT_PROFILES: Curated typography stacks.
 */
const FONT_PROFILES = {
    inter: {
        name: 'Modern Sans (Inter)',
        sans: '"Inter", sans-serif',
        display: '"Inter", sans-serif', // Changed to match sans for uniformity
        mono: '"JetBrains Mono", monospace'
    },
    geist: {
        name: 'Geist Technical',
        sans: '"Geist", sans-serif',
        display: '"Geist", sans-serif',
        mono: '"Geist", monospace'
    },
    outfit: {
        name: 'Geometric Pro (Outfit)',
        sans: '"Outfit", sans-serif',
        display: '"Outfit", sans-serif',
        mono: '"JetBrains Mono", monospace'
    },
    mono: {
        name: 'Data Focus (Mono)',
        sans: '"JetBrains Mono", monospace',
        display: '"JetBrains Mono", monospace', // Changed to force all-mono look
        mono: '"JetBrains Mono", monospace'
    }
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
    const [surfacePalette, setSurfacePalette] = useState(() => localStorage.getItem('surfacePalette') || 'antigravity');
    const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accentColor') || 'indigo');
    const [fontFamily, setFontFamily] = useState(() => localStorage.getItem('fontFamily') || 'inter');

    // Function to apply typography immediately to CSS variables (Preview Mode)
    const applyFontPreview = useCallback((fontId) => {
        const root = window.document.documentElement;
        const fonts = FONT_PROFILES[fontId] || FONT_PROFILES.inter;
        root.style.setProperty('--font-sans', fonts.sans);
        root.style.setProperty('--font-display', fonts.display);
        root.style.setProperty('--font-mono', fonts.mono);
    }, []);

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

        // 3. Typography Variables
        const fonts = FONT_PROFILES[fontFamily] || FONT_PROFILES.inter;
        root.style.setProperty('--font-sans', fonts.sans);
        root.style.setProperty('--font-display', fonts.display);
        root.style.setProperty('--font-mono', fonts.mono);

        localStorage.setItem('surfacePalette', surfacePalette);
        localStorage.setItem('accentColor', accentColor);
        localStorage.setItem('fontFamily', fontFamily);
    }, [theme, surfacePalette, accentColor, fontFamily]);

    return (
        <ThemeContext.Provider value={{
            theme, toggleTheme: () => setTheme(v => v === 'light' ? 'dark' : 'light'), setTargetTheme: setTheme,
            surfacePalette, setSurfacePalette, palettes: SURFACE_PALETTES,
            accentColor, setAccentColor, accents: ACCENT_COLORS,
            fontFamily, setFontFamily, fonts: FONT_PROFILES,
            applyFontPreview
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
