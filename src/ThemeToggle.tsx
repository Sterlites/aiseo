import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className={`
        fixed top-4 right-4 p-2 rounded-full
        transition-all duration-500 ease-in-out
        ${theme === 'dark' 
          ? 'bg-gray-800 hover:bg-gray-700' 
          : 'bg-gray-200 hover:bg-gray-300'
        }
      `}
      aria-label="Toggle theme"
    >
      <div className="relative w-6 h-6">
        <div className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`}>
          <Moon className={`w-6 h-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`} />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`}>
          <Sun className={`w-6 h-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`} />
        </div>
      </div>
    </button>
  );
}