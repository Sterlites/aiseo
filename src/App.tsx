import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Globe, ArrowRight, Loader2 } from "lucide-react";
import SEODashboard from './components/SEODashboard';
import { ThemeProvider } from './ThemeProvider';
import ThemeToggle from './ThemeToggle';
import { SEOReport } from "./types";

export default function App() {
  const [seoReport, setSEOReport] = useState<SEOReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setSEOReport(null);
    
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        // If not JSON, get the text and show it as an error
        const textResponse = await response.text();
        throw new Error(textResponse || `Server returned ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      setSEOReport(data);
    } catch (err) {
      console.error('Error analyzing URL:', err);
      setError(`Failed to analyze URL: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white transition-colors duration-500">
        <ThemeToggle />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 space-y-6"
          >
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
              <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} />
            </motion.div>
          </div>
          
          <h1 className="text-7xl font-bold tracking-tighter">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              AI-Powered
            </span>
            <br />SEO Analysis
          </h1>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Harness the power of artificial intelligence to optimize your website's visibility and performance.
          </p>
          
          <motion.div 
            className="flex items-center justify-center text-gray-400 space-x-4"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-5 h-5" />
            <span>Powered by advanced machine learning</span>
            <Sparkles className="w-5 h-5" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
         <form onSubmit={(e) => {
            e.preventDefault();
            const urlInput = e.currentTarget.querySelector('input') as HTMLInputElement;
            if (urlInput && urlInput.value) handleAnalyze(urlInput.value);
          }} className="relative max-w-4xl mx-auto mb-12">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
              <div className="relative bg-gray-900 rounded-2xl p-2">
                <div className="flex items-center">
                  <Globe className="ml-4 mr-2 text-gray-400" />
                  <input
                    className="w-full px-4 py-4 bg-transparent text-lg outline-none text-white placeholder-gray-400"
                    type="text"
                    placeholder="Enter website URL (e.g., example.com)"
                    pattern="^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}$"
                    title="Please enter a valid domain (e.g., example.com)"
                    required
                  />
                  <button
                    className={`
                      flex items-center justify-center min-w-[140px] h-12 px-6 mr-2
                      font-medium rounded-xl transition-all duration-300
                      ${isLoading 
                        ? 'bg-gray-700 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90'
                      }
                    `}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        <span className="mr-2">Analyze</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </motion.div>

        <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-4xl mx-auto mb-8 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {seoReport && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.5 }}
              >
                <SEODashboard report={seoReport} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </ThemeProvider>
  );
}