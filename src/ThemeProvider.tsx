import * as React from 'react';
type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isTransitioning: boolean;
  currentDisplayTheme: 'light' | 'dark'; // Actual theme being displayed
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>('system');
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [currentDisplayTheme, setCurrentDisplayTheme] = React.useState<'light' | 'dark'>('dark');

  // Handle system theme changes
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        setCurrentDisplayTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Initial theme setup
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Update current display theme when theme changes
  React.useEffect(() => {
    let newDisplayTheme: 'light' | 'dark';
    
    if (theme === 'system') {
      newDisplayTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      newDisplayTheme = theme as 'light' | 'dark';
    }

    document.documentElement.classList.remove('light', 'dark');
    setIsTransitioning(true);
    
    const transitionTimeout = setTimeout(() => {
      document.documentElement.classList.add(newDisplayTheme);
      localStorage.setItem('theme', theme);
      setCurrentDisplayTheme(newDisplayTheme);
      
      // Allow time for transition to complete
      setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
    }, 50);

    return () => clearTimeout(transitionTimeout);
  }, [theme]);

  const toggleTheme = React.useCallback(() => {
    setTheme(prevTheme => {
      switch (prevTheme) {
        case 'dark': return 'light';
        case 'light': return 'system';
        case 'system': return 'dark';
      }
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isTransitioning, currentDisplayTheme }}>
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