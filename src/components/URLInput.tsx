import * as React from 'react';
import { motion } from 'framer-motion';
import { Search, Globe } from 'lucide-react';
import { useTheme } from '../ThemeProvider';

interface URLInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}


const URLInput: React.FC<URLInputProps> = ({ onAnalyze, isLoading }) => {
  const { isTransitioning } = useTheme();
  const [url, setUrl] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(false);
  const [showCompletionEffect, setShowCompletionEffect] = React.useState(false);
  const completionTimer = React.useRef<NodeJS.Timeout>();

  // Enhanced completion effect handling
  React.useEffect(() => {
    if (!isLoading && url) {
      setShowCompletionEffect(true);
      completionTimer.current = setTimeout(() => {
        setShowCompletionEffect(false);
      }, 1500);
    }
    return () => {
      if (completionTimer.current) {
        clearTimeout(completionTimer.current);
      }
    };
  }, [isLoading, url]);

  const isValidUrl = (url: string): boolean => {
    // Enhanced URL validation
    try {
      // First try to construct a URL object
      if (url.startsWith('http://') || url.startsWith('https://')) {
        new URL(url);
        return true;
      }
      // Try with https:// prefix if no protocol specified
      new URL(`https://${url}`);
      return true;
    } catch {
      // If URL construction fails, try regex for basic domain validation
      const pattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,})([\/\w .-]*)*\/?$/i;
      return pattern.test(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && !isLoading && isValidUrl(url)) {
      const urlWithProtocol = url.startsWith('http://') || url.startsWith('https://')
        ? url
        : `https://${url}`;
      onAnalyze(urlWithProtocol);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value.trim());
  };
  
  const loadingVariants = {
    idle: {
      rotate: 0,
      scale: 1,
    },
    loading: {
      rotate: 360,
      scale: 1.2,
      transition: {
        rotate: {
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        },
        scale: {
          duration: 1,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }
      }
    },
    complete: {
      rotate: 360,
      scale: 1,
      transition: {
        rotate: {
          duration: 0.5,
          ease: "easeInOut",
        },
        scale: {
          duration: 0.5,
          ease: "easeInOut",
          keyframes: [1, 1.3, 0.9, 1.1, 0.95, 1]
        }
      }
    }
  } as const;

 // Enhanced button loading animation
 const buttonLoadingVariants = {
  initial: {
    opacity: 1,
    scale: 1
  },
  loading: {
    opacity: 0.8,
    scale: 0.98,
    transition: {
      opacity: {
        duration: 0.75,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      },
      scale: {
        duration: 0.75,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  }
} as const;

return (
  <div className="w-full max-w-4xl mx-auto mb-12">
    <form onSubmit={handleSubmit} className="relative">
        <div className="relative group">
          <motion.div
            animate={{
              opacity: isFocused ? 1 : 0.7,
              scale: isFocused ? 1.02 : 1,
            }}
            transition={{ duration: 0.3 }}
            className={`
              absolute -inset-0.5 
              bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 
              rounded-2xl blur opacity-75 
              group-hover:opacity-100 
              transition-all duration-700
              ${isTransitioning ? 'opacity-0' : ''}
            `}
          />
          <div 
            className={`
              relative rounded-2xl p-2 
              bg-white dark:bg-gray-900 
              transition-all duration-700
              ${isTransitioning ? 'opacity-0' : ''}
            `}
          >
        <div className="flex items-center">
          <motion.div
            variants={loadingVariants}
            initial="idle"
            animate={
              isLoading 
                ? "loading" 
                : showCompletionEffect 
                ? "complete" 
                : "idle"
            }
            className="ml-4 mr-2"
          >
            <Globe 
              className={`
                transition-colors duration-500
                ${isLoading 
                  ? 'text-blue-500 dark:text-blue-400' 
                  : showCompletionEffect 
                    ? 'text-green-500 dark:text-green-400'
                    : 'text-gray-600 dark:text-gray-400'
                }
              `}
              size={20} 
            />
          </motion.div>
              <input
                // ref={inputRef}
                className={`
                  w-full px-4 py-4 text-lg outline-none
                  bg-transparent
                  text-gray-800 dark:text-white
                  placeholder-gray-600 dark:placeholder-gray-400
                  transition-colors duration-500
                  disabled:opacity-50
                `}
                type="text"
                placeholder="Enter website URL (e.g., example.com or https://example.com)"
                value={url}
                onChange={handleUrlChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={isLoading}
                aria-label="Website URL"
                required
              />
          <motion.button
            variants={buttonLoadingVariants}
            initial="initial"
            animate={isLoading ? "loading" : "initial"}
            whileHover={!isLoading ? { scale: 1.05 } : {}}
            whileTap={!isLoading ? { scale: 0.95 } : {}}
            className={`
              flex items-center justify-center
              min-w-[140px] h-12 px-6 mr-2
              font-medium rounded-xl
              transition-all duration-500
              ${isLoading || !isValidUrl(url)
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 text-white'
              }
              ${isTransitioning ? 'opacity-0' : ''}
            `}
            type="submit"
            disabled={isLoading || !isValidUrl(url)}
          >
            {isLoading ? (
              <div className="relative w-6 h-6">
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    rotate: [0, 360],
                    borderRadius: ["20%", "50%"],
                    border: ["2px solid rgba(255,255,255,0.2)", "2px solid rgba(255,255,255,0.8)"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <motion.div
                  className="absolute inset-1"
                  animate={{
                    rotate: [360, 0],
                    borderRadius: ["50%", "20%"],
                    border: ["2px solid rgba(255,255,255,0.8)", "2px solid rgba(255,255,255,0.2)"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </div>
            ) : (
              <motion.div
                initial={false}
                animate={{ x: isFocused ? 5 : 0 }}
                className="flex items-center"
              >
                <Search className="w-5 h-5" />
                <span className="ml-2">Analyze</span>
              </motion.div>
            )}
          </motion.button>
        </div>
          </div>
        </div>

        {url && !isValidUrl(url) && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-amber-600 dark:text-amber-400 transition-colors duration-500"
            role="alert"
          >
            Please enter a valid URL (e.g., example.com or https://example.com)
          </motion.p>
        )}
      </form>
    </div>
  );
};

export default URLInput;