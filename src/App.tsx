import { useState } from "react";
import { Search } from "lucide-react";
import URLInput from "./components/URLInput";
import SEODashboard from './components/SEODashboard';
import { SEOReport } from "./types";

function App() {
  const [seoReport, setSEOReport] = useState<SEOReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (url: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:3000/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSEOReport(data);
    } catch (err) {
      let errorMessage = "An unknown error occurred";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(`An error occurred while analyzing the website: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 inline-block text-transparent bg-clip-text">
            AI SEO Analyzer
          </h1>
          <p className="text-xl text-gray-600">
            Discover how to improve your website's SEO with AI-powered insights
          </p>
        </div>
        
        <URLInput onAnalyze={handleAnalyze} isLoading={isLoading} />
        
        {error && (
          <div className="w-full max-w-4xl mx-auto mb-8 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            {error}
          </div>
        )}
        
        {seoReport && <SEODashboard report={seoReport} />}
      </div>
    </div>
  );
}

export default App;