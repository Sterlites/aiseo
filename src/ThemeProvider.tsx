import * as React from 'react';
type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isTransitioning: boolean;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>('dark');
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  React.useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    setIsTransitioning(true);
    
    const transitionTimeout = setTimeout(() => {
      document.documentElement.classList.add(theme);
      localStorage.setItem('theme', theme);
      
      // Allow time for transition to complete
      setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
    }, 50);

    return () => clearTimeout(transitionTimeout);
  }, [theme]);

  const toggleTheme = React.useCallback(() => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isTransitioning }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}