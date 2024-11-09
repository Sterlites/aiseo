import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain, Zap } from "lucide-react";
import SEODashboard from './components/SEODashboard';
import URLInput from './components/URLInput';
import { ThemeProvider } from './ThemeProvider';
import ThemeToggle from './ThemeToggle';
import { EnhancedSEOReport } from "./types";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 p-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-md shadow-lg w-64 bottom-full left transform -translate-x-1/2 mb-2"
          >
            <motion.div
              animate={{
                background: [
                  "linear-gradient(0deg, #3b82f6, #8b5cf6)",
                  "linear-gradient(60deg, #3b82f6, #8b5cf6)",
                  "linear-gradient(120deg, #3b82f6, #8b5cf6)",
                  "linear-gradient(180deg, #3b82f6, #8b5cf6)",
                  "linear-gradient(240deg, #3b82f6, #8b5cf6)",
                  "linear-gradient(300deg, #3b82f6, #8b5cf6)",
                  "linear-gradient(360deg, #3b82f6, #8b5cf6)",
                ],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 opacity-10 rounded-md"
            />
            <p className="relative z-10">{text}</p>
            <div className="absolute w-3 h-3 bg-white dark:bg-gray-800 transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1.5"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface FeatureBadgeProps {
  icon: any;
  text: string;
  tooltip: string;
}

const FeatureBadge = ({ icon: Icon, text, tooltip }: FeatureBadgeProps) => (
  <Tooltip text={tooltip}>
  <motion.div 
    className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-md cursor-pointer"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <Icon className="w-5 h-5" />
    <span>{text}</span>
  </motion.div>
</Tooltip>
);

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
          Pragma: "no-cache",
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
        throw new Error(
          textResponse ||
            `Server returned ${response.status} ${response.statusText}`
        );
      }

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      setSEOReport(data);
    } catch (err) {
      console.error("Error analyzing URL:", err);
      setError(
        err instanceof Error
          ? `Unable to analyze URL: ${err.message}`
          : "An unexpected error occurred while analyzing the URL"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen pt-20 bg-gradient-to-br from-white via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white transition-colors duration-500">
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
                    "0 0 0 40px rgba(88, 80, 236, 0)",
                  ],
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
                  style={{
                    clipPath:
                      "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                  }}
                />
              </motion.div>
            </div>

            {/* Title */}
            <h1 className="text-7xl font-bold tracking-tighter">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                AI-Powered SEO
              </span>
              <br />
              for the New Era
            </h1>

             {/* Subtitle */}
             <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
             The SEO landscape has been transformed by advancements in generative AI and Retrieval-Augmented Generation (RAG). Leverage this cutting-edge technology to make your website AI-SEO ready and outshine your competition in the modern search engine landscape.
            </p>
            
            {/* Feature Badges */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-gray-500 dark:text-gray-400">
              <FeatureBadge 
                icon={Brain} 
                text="AI-Driven Analysis" 
                tooltip="Our advanced AI algorithms analyze your website's content, structure, and performance to provide insights that traditional SEO tools miss."
              />
              <FeatureBadge 
                icon={Zap} 
                text="RAG-Optimized Content" 
                tooltip="Leverage Retrieval-Augmented Generation (RAG) to create content that's not just keyword-optimized, but contextually rich and highly relevant to both users and AI-powered search engines."
              />
              <FeatureBadge 
                icon={Sparkles} 
                text="Future-Proof SEO Strategy" 
                tooltip="Stay ahead of the curve with SEO strategies designed to excel in the age of AI-driven search, ensuring your website remains competitive as search algorithms evolve."
              />
            </div>
          </motion.section>

          {/* URL Input Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-16"
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
