import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Default to 'light' if no preference is saved
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved || 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;

        root.classList.add('theme-transitioning');
        root.classList.remove('dark');

        if (theme === 'dark') {
            root.classList.add('dark');
        }

        localStorage.setItem('theme', theme);

        const timer = setTimeout(() => {
            root.classList.remove('theme-transitioning');
        }, 300);

        return () => clearTimeout(timer);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
