// =============================================================
// theme.jsx - manajemen tema aplikasi SiNC (Dual Engine)
// Mendukung mode 'light' (Industrial Blueprint) & 'dark' (Machining Steel Cockpit)
// =============================================================
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('sinc_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    // Bawaan default: Light Blueprint untuk keterbacaan tinggi di proyektor & kelas
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sinc_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
