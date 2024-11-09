import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme, currentDisplayTheme } = useTheme();
  
  const getIcon = () => {
    switch (theme) {
      case 'dark': return <Sun className={`w-6 h-6 ${currentDisplayTheme === 'dark' ? 'text-white' : 'text-gray-800'}`} />;
      case 'light': return <Monitor className={`w-6 h-6 ${currentDisplayTheme === 'dark' ? 'text-white' : 'text-gray-800'}`} />;
      case 'system': return <Moon className={`w-6 h-6 ${currentDisplayTheme === 'dark' ? 'text-white' : 'text-gray-800'}`} />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'dark': return 'Switch to light mode';
      case 'light': return 'Switch to system mode';
      case 'system': return 'Switch to dark mode';
    }
  };
  
  return (
    <button
      onClick={toggleTheme}
      className={`
        fixed top-4 right-4 p-2 rounded-full
        transition-all duration-500 ease-in-out
        ${currentDisplayTheme === 'dark' 
          ? 'bg-gray-800 hover:bg-gray-700' 
          : 'bg-gray-200 hover:bg-gray-300'
        }
      `}
      aria-label={getLabel()}
    >
      <div className="relative w-6 h-6">
        {getIcon()}
      </div>
    </button>
  );
}