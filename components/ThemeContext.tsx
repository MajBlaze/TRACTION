"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';

type AccentTheme = 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'pink';
type Mode = 'light' | 'dark';

interface ThemeContextType {
  mode: Mode;
  accent: AccentTheme;
  setMode: (mode: Mode) => void;
  setAccent: (accent: AccentTheme) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<Mode>('dark');
  const [accent, setAccent] = useState<AccentTheme>('default');

  useEffect(() => {
    const savedMode = localStorage.getItem('traction_mode') as Mode;
    const savedAccent = localStorage.getItem('traction_accent') as AccentTheme;
    if (savedMode) setMode(savedMode);
    if (savedAccent) setAccent(savedAccent);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'theme-blue', 'theme-green', 'theme-purple', 'theme-orange', 'theme-pink');
    
    root.classList.add(mode);
    if (accent !== 'default') {
      root.classList.add(`theme-${accent}`);
    }

    localStorage.setItem('traction_mode', mode);
    localStorage.setItem('traction_accent', accent);
  }, [mode, accent]);

  const toggleMode = () => setMode(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ mode, accent, setMode, setAccent, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTractionTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTractionTheme must be used within ThemeProvider');
  return context;
};
