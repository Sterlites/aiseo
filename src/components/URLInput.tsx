import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Globe, Loader2 } from 'lucide-react';

interface URLInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

const URLInput: React.FC<URLInputProps> = ({ onAnalyze, isLoading }) => {
  const [url, setUrl] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && isValidUrl(url)) {
      // Ensure the URL has a protocol before passing it to onAnalyze
      const urlWithProtocol = url.startsWith('http://') || url.startsWith('https://') 
        ? url 
        : `https://${url}`;
      onAnalyze(urlWithProtocol);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputUrl = e.target.value.trim();
    setUrl(inputUrl);
  };

  const isValidUrl = (url: string) => {
    // This regex allows URLs with or without protocol, www, subdomains, and paths
    const pattern = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+(\.[a-zA-Z]{2,})?([\/\w \.-]*)*\/?$/;
    return pattern.test(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto mb-12"
    >
      <form onSubmit={handleSubmit}>
        <div className="relative group">
          <motion.div
            animate={{
              opacity: isFocused ? 1 : 0.7,
              scale: isFocused ? 1.02 : 1,
            }}
            className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"
          />
          <div className="relative rounded-2xl p-2 bg-white/5 dark:bg-gray-900 backdrop-blur-sm transition-colors duration-200">
            <div className="flex items-center">
              <motion.div
                animate={{ rotate: isLoading ? 360 : 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="ml-4 mr-2"
              >
                <Globe className="text-gray-500 dark:text-gray-400" size={20} />
              </motion.div>
              <input
                className="w-full px-4 py-4 text-lg bg-transparent outline-none 
                          text-gray-900 dark:text-white 
                          placeholder-gray-500 dark:placeholder-gray-400 
                          transition-colors duration-200"
                type="text"
                placeholder="Enter website URL (e.g., example.com or https://example.com)"
                value={url}
                onChange={handleUrlChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                required
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  flex items-center justify-center
                  min-w-[140px] h-12 px-6 mr-2
                  font-medium rounded-xl
                  transition-all duration-300
                  ${isLoading || !isValidUrl(url)
                    ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 text-white'
                  }
                `}
                type="submit"
                disabled={isLoading || !isValidUrl(url)}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={false}
                    animate={{ x: isFocused ? 5 : 0 }}
                    className="flex items-center"
                  >
                    <Search size={18} />
                    <span className="ml-2">Analyze</span>
                  </motion.div>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Optional validation message with theme support */}
        {url && !isValidUrl(url) && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-amber-600 dark:text-amber-400 transition-colors duration-200"
          >
            Please enter a valid URL (e.g., example.com or https://example.com)
          </motion.p>
        )}
      </form>
    </motion.div>
  );
};

export default URLInput;