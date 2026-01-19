import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

const THEME_COLORS = {
    zinc: {
        light: { primary: '240 5.9% 10%', ring: '240 5.9% 10%' },
        dark: { primary: '0 0% 98%', ring: '0 0% 98%' }
    },
    slate: {
        light: { primary: '215 16% 47%', ring: '215 16% 47%' },
        dark: { primary: '215 20% 65%', ring: '215 20% 65%' }
    },
    stone: {
        light: { primary: '25 5.3% 44.7%', ring: '25 5.3% 44.7%' },
        dark: { primary: '33 5.5% 81%', ring: '33 5.5% 81%' }
    },
    gray: {
        light: { primary: '220 9% 46%', ring: '240 5% 64.9%' },
        dark: { primary: '220 9% 46%', ring: '240 5% 64.9%' }
    },
    neutral: {
        light: { primary: '0 0% 45%', ring: '0 0% 45%' },
        dark: { primary: '0 0% 64%', ring: '0 0% 64%' }
    },
    red: {
        light: { primary: '0 72.2% 50.6%', ring: '0 72.2% 50.6%' },
        dark: { primary: '0 72.2% 50.6%', ring: '0 72.2% 50.6%' }
    },
    rose: {
        light: { primary: '346.8 77.2% 49.8%', ring: '346.8 77.2% 49.8%' },
        dark: { primary: '346.8 77.2% 49.8%', ring: '346.8 77.2% 49.8%' }
    },
    orange: {
        light: { primary: '24.6 95% 53.1%', ring: '24.6 95% 53.1%' },
        dark: { primary: '20.5 90.2% 48.2%', ring: '20.5 90.2% 48.2%' }
    },
    green: {
        light: { primary: '142.1 76% 36.3%', ring: '142.1 76% 36.3%' },
        dark: { primary: '142.1 70.6% 45.3%', ring: '142.1 70.6% 45.3%' }
    },
    blue: {
        light: { primary: '221.2 83.2% 53.3%', ring: '221.2 83.2% 53.3%' },
        dark: { primary: '217.2 91.2% 59.8%', ring: '217.2 91.2% 59.8%' }
    },
    yellow: {
        light: { primary: '47.9 95.8% 53.1%', ring: '47.9 95.8% 53.1%' },
        dark: { primary: '47.9 95.8% 53.1%', ring: '47.9 95.8% 53.1%' }
    },
    violet: {
        light: { primary: '262.1 83.3% 57.8%', ring: '262.1 83.3% 57.8%' },
        dark: { primary: '263.4 70% 50.4%', ring: '263.4 70% 50.4%' }
    },
}

export const ThemeProvider = ({ children }) => {
    // Mode (Light/Dark)
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved || 'light';
    });

    // Color Theme (Zinc, Blue, etc.)
    const [colorTheme, setColorTheme] = useState(() => {
        const saved = localStorage.getItem('colorTheme');
        return saved || 'zinc';
    });

    // Apply Mode
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.add('theme-transitioning');
        root.classList.remove('dark');
        if (theme === 'dark') {
            root.classList.add('dark');
        }
        localStorage.setItem('theme', theme);
        setTimeout(() => root.classList.remove('theme-transitioning'), 300);
    }, [theme]);

    // Apply Color Theme
    useEffect(() => {
        const root = window.document.documentElement;
        const colors = THEME_COLORS[colorTheme] || THEME_COLORS.zinc;
        const activeColors = theme === 'dark' ? colors.dark : colors.light;

        root.style.setProperty('--primary', activeColors.primary);
        root.style.setProperty('--ring', activeColors.ring);

        localStorage.setItem('colorTheme', colorTheme);
    }, [theme, colorTheme]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
    const setTargetTheme = (t) => setTheme(t);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTargetTheme, colorTheme, setColorTheme, colors: THEME_COLORS }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
