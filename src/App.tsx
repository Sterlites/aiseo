import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain, Zap } from "lucide-react";
import SEODashboard from './components/SEODashboard';
import URLInput from './components/URLInput';
import { ThemeProvider } from './ThemeProvider';
import ThemeToggle from './ThemeToggle';
import { EnhancedSEOReport } from "./types";


export default function App() {
  const [seoReport, setSEOReport] = useState<EnhancedSEOReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (url: string) => {
    // Reset state before new analysis
    setIsLoading(true);
    setError(null);
    setSEOReport(null);
    
    try {
      const response = await fetch("/api/seo/seoanalyze", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        },
        body: JSON.stringify({ url }),
      });

      // Handle response
      const contentType = response.headers.get("content-type");
      let data;
      
      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        const textResponse = await response.text();
        throw new Error(textResponse || `Server returned ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      setSEOReport(data);
    } catch (err) {
      console.error('Error analyzing URL:', err);
      setError(err instanceof Error 
        ? `Unable to analyze URL: ${err.message}` 
        : 'An unexpected error occurred while analyzing the URL');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white transition-colors duration-500">
        <ThemeToggle />
        <main className="max-w-7xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 space-y-6"
          >
            {/* Animated Logo */}
            <div className="relative inline-block">
              <motion.div
                animate={{ 
                  boxShadow: [
                    "0 0 0 0 rgba(88, 80, 236, 0)",
                    "0 0 0 20px rgba(88, 80, 236, 0.2)",
                    "0 0 0 40px rgba(88, 80, 236, 0)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full"
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 mx-auto mb-6"
              >
                <div 
                  className="w-full h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" 
                  style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} 
                />
              </motion.div>
            </div>
            
            {/* Title */}
            <h1 className="text-7xl font-bold tracking-tighter">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                AI-Powered SEO
              </span>
              <br />for the New Era
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The SEO landscape has evolved. Harness the power of generative AI and Retrieval-Augmented Generation (RAG) to make your website truly AI-SEO ready and dominate the modern search engine landscape.
            </p>
            
            {/* Feature Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-gray-500 dark:text-gray-400">
              <motion.div 
                className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Brain className="w-5 h-5" />
                <span>AI-Driven Analysis</span>
              </motion.div>
              <motion.div 
                className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Zap className="w-5 h-5" />
                <span>RAG-Optimized Content</span>
              </motion.div>
              <motion.div 
                className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="w-5 h-5" />
                <span>Future-Proof SEO Strategy</span>
              </motion.div>
            </div>
          </motion.section>

          {/* URL Input Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <URLInput onAnalyze={handleAnalyze} isLoading={isLoading} />
          </motion.section>

          {/* Error Message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-4xl mx-auto mb-8 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400"
                role="alert"
                aria-live="polite"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* SEO Dashboard */}
          <AnimatePresence mode="wait">
            {seoReport && (
              <motion.section
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.5 }}
              >
                <SEODashboard report={seoReport} />
              </motion.section>
            )}
          </AnimatePresence>
        </main>
      </div>
    </ThemeProvider>
  );
}