import React, { useState } from 'react';
import { Search, Globe } from 'lucide-react';

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

  return (
    <div className="w-full max-w-4xl mb-12">
      <form onSubmit={handleSubmit} className="relative">
        <div 
          className={`
            relative overflow-hidden rounded-2xl 
            transition-all duration-300 ease-out
            ${isFocused ? 'shadow-lg scale-105' : 'shadow'}
          `}
        >
          {/* Background animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient" />
          
          {/* Input container */}
          <div className="relative bg-white m-[2px] rounded-2xl p-2">
            <div className="flex items-center">
              <Globe className="ml-4 mr-2 text-gray-400" size={20} />
              <input
                className="w-full px-4 py-4 text-lg bg-transparent outline-none text-gray-700 placeholder-gray-400"
                type="url"
                placeholder="Enter any website URL..."
                aria-label="Website URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                required
              />
              <button
                className={`
                  flex items-center justify-center
                  min-w-[120px] h-12 px-6 mr-2
                  font-medium rounded-xl
                  transition-all duration-300
                  ${isLoading 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90'
                  }
                `}
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400" />
                    <span className="ml-2">Analyzing</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Search size={18} />
                    <span className="ml-2">Analyze</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default URLInput;