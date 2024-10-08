import { useState } from "react";
import { Sparkles } from "lucide-react";
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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-6xl font-bold tracking-tight">
            <span className="text-gradient">AI-Powered</span> SEO Analysis
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Optimize your website's SEO with our cutting-edge 
            <span className="text-primary"> artificial intelligence</span>.
          </p>
          <div className="flex items-center justify-center text-muted-foreground">
            <Sparkles className="w-5 h-5 mr-2" />
            <span>Powered by advanced machine learning</span>
          </div>
        </div>
        
        <URLInput onAnalyze={handleAnalyze} isLoading={isLoading} />
        
        {error && (
          <div className="w-full max-w-4xl mx-auto mb-8 bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-destructive">
            {error}
          </div>
        )}
        
        {seoReport && <SEODashboard report={seoReport} />}
      </div>
    </div>
  );
}

export default App;