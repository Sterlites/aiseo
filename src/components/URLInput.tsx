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
    if (url) {
      onAnalyze(url);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputUrl = e.target.value;
    
    // Remove any whitespace
    inputUrl = inputUrl.trim();
    
    // Remove protocol if user types it
    inputUrl = inputUrl.replace(/^(https?:\/\/)/, '');
    
    setUrl(inputUrl);
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
          <div className="relative bg-gray-900 rounded-2xl p-2">
            <div className="flex items-center">
              <motion.div
                animate={{ rotate: isLoading ? 360 : 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="ml-4 mr-2"
              >
                <Globe className="text-gray-400" size={20} />
              </motion.div>
              <input
                className="w-full px-4 py-4 text-lg bg-transparent outline-none text-white placeholder-gray-400 transition-all duration-300"
                type="text"
                placeholder="Enter website URL (e.g., example.com)"
                value={url}
                onChange={handleUrlChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                required
                pattern="^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}$"
                title="Please enter a valid domain (e.g., example.com)"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  flex items-center justify-center
                  min-w-[140px] h-12 px-6 mr-2
                  font-medium rounded-xl
                  transition-all duration-300
                  ${isLoading 
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90'
                  }
                `}
                type="submit"
                disabled={isLoading}
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
      </form>
    </motion.div>
  );
};

export default URLInput;