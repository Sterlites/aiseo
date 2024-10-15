import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  ExternalLink,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Expand,
  Minimize,
} from "lucide-react";
import { EnhancedSEOReport, DetailedSEOScore, Recommendation } from "../types";

interface SEODashboardProps {
  report: EnhancedSEOReport;
}

const SEODashboard: React.FC<SEODashboardProps> = ({ report }) => {
  const [expandedScores, setExpandedScores] = React.useState<Set<string>>(
    new Set()
  );
  const [expandedRecommendations, setExpandedRecommendations] = React.useState<
    Set<string>
  >(new Set());

  const toggleAllScores = () => {
    if (expandedScores.size === Object.keys(report.detailedScores).length) {
      setExpandedScores(new Set());
    } else {
      setExpandedScores(new Set(Object.keys(report.detailedScores)));
    }
  };

  const toggleAllRecommendations = () => {
    if (expandedRecommendations.size === report.recommendations.length) {
      setExpandedRecommendations(new Set());
    } else {
      setExpandedRecommendations(
        new Set(report.recommendations.map((rec) => rec.id))
      );
    }
  };

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto space-y-8 p-4 sm:p-6 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ScoreCard report={report} />
      <ImprovementCards report={report} />
      <DetailedScores
        report={report}
        expandedScores={expandedScores}
        setExpandedScores={setExpandedScores}
        toggleAllScores={toggleAllScores}
      />
      <Recommendations
        report={report}
        expandedRecommendations={expandedRecommendations}
        setExpandedRecommendations={setExpandedRecommendations}
        toggleAllRecommendations={toggleAllRecommendations}
      />
    </motion.div>
  );
};

const ScoreCard: React.FC<{ report: EnhancedSEOReport }> = ({ report }) => {
  return (
    <motion.div
      className="relative group"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
      <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-lg transition-colors duration-200">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                SEO Analysis Results
              </h2>
              <a
                href={report.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm sm:text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {report.url} <ExternalLink size={16} className="ml-1" />
              </a>
            </div>
            <motion.div
              className="text-center mt-4 sm:mt-0"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <div className="text-5xl sm:text-6xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                {report.overallScore.score}
              </div>
              <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                SEO Score
              </div>
            </motion.div>
          </div>

          <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden transition-colors duration-200">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${report.overallScore.score}%` }}
              transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ImprovementCards: React.FC<{ report: EnhancedSEOReport }> = ({
  report,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
      <AnimatedCard
        title="Positive Aspects"
        icon={<CheckCircle className="text-emerald-400" />}
        items={report.overallScore.bonuses}
        colorClass="from-emerald-600/20 to-teal-600/20"
      />
      <AnimatedCard
        title="Areas for Improvement"
        icon={<AlertTriangle className="text-orange-400" />}
        items={report.overallScore.penalties}
        colorClass="from-orange-600/20 to-red-600/20"
      />
    </div>
  );
};

const AnimatedCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  items: string[];
  colorClass: string;
}> = ({ title, icon, items, colorClass }) => {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const shadowRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const updateShadow = () => {
      if (cardRef.current && shadowRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        shadowRef.current.style.width = `${rect.width + 8}px`;
        shadowRef.current.style.height = `${rect.height + 8}px`;
      }
    };

    updateShadow();
    window.addEventListener('resize', updateShadow);
    return () => window.removeEventListener('resize', updateShadow);
  }, []);

  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      <div
        ref={shadowRef}
        className={`absolute -inset-1 bg-gradient-to-r ${colorClass} rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300`}
      />
      <div
        ref={cardRef}
        className="relative rounded-2xl p-6 bg-white/5 dark:bg-gray-900 backdrop-blur-sm transition-colors duration-200"
      >
        <h3 className="flex items-center text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {icon}
          <span className="ml-2">{title}</span>
        </h3>
        <ul className="space-y-2">
          {items.map((item, index) => (
            <motion.li
              key={index}
              className="flex items-start"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ArrowUpRight
                className="mr-2 mt-1 text-gray-500 dark:text-gray-400 flex-shrink-0"
                size={16}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {item}
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

const DetailedScores: React.FC<{
  report: EnhancedSEOReport;
  expandedScores: Set<string>;
  setExpandedScores: React.Dispatch<React.SetStateAction<Set<string>>>;
  toggleAllScores: () => void;
}> = ({ report, expandedScores, setExpandedScores, toggleAllScores }) => {
  const toggleScore = (key: string) => {
    setExpandedScores((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          Detailed Scores
        </h3>
        <button
          onClick={toggleAllScores}
          className="flex items-center space-x-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
        >
          {expandedScores.size === Object.keys(report.detailedScores).length ? (
            <>
              <Minimize size={20} />
              <span>Collapse All</span>
            </>
          ) : (
            <>
              <Expand size={20} />
              <span>Expand All</span>
            </>
          )}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(report.detailedScores).map(([key, score]) => (
          <DetailedScoreCard
            key={key}
            title={key}
            score={score}
            isExpanded={expandedScores.has(key)}
            onToggle={() => toggleScore(key)}
          />
        ))}
      </div>
    </div>
  );
};

const DetailedScoreCard: React.FC<{
  title: string;
  score: DetailedSEOScore;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ title, score, isExpanded, onToggle }) => {
  return (
    <div className="relative group">
      <motion.div
        className="relative rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-lg transition-all duration-200"
        layout
      >
        <div className="p-6">
          <div
            className="flex items-center justify-between mb-2 cursor-pointer"
            onClick={onToggle}
          >
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h4>
            <div className="flex items-center">
              <span className="font-bold text-blue-500 mr-2">
                {score.score}
              </span>
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-gray-700 dark:text-gray-300 mt-2"
              >
                <p>
                  <strong>Category:</strong> {score.category}
                </p>
                <p>
                  <strong>Value:</strong> {score.details.value}
                </p>
                <p>
                  <strong>Impact:</strong> {score.details.impact}
                </p>
                {score.details.context && (
                  <p>
                    <strong>Context:</strong> {score.details.context}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300 -z-10" />
    </div>
  );
};

const Recommendations: React.FC<{
  report: EnhancedSEOReport;
  expandedRecommendations: Set<string>;
  setExpandedRecommendations: React.Dispatch<React.SetStateAction<Set<string>>>;
  toggleAllRecommendations: () => void;
}> = ({
  report,
  expandedRecommendations,
  setExpandedRecommendations,
  toggleAllRecommendations,
}) => {
  const toggleRecommendation = (id: string) => {
    setExpandedRecommendations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          Detailed Recommendations
        </h3>
        <button
          onClick={toggleAllRecommendations}
          className="flex items-center space-x-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
        >
          {expandedRecommendations.size === report.recommendations.length ? (
            <>
              <Minimize size={20} />
              <span>Collapse All</span>
            </>
          ) : (
            <>
              <Expand size={20} />
              <span>Expand All</span>
            </>
          )}
        </button>
      </div>
      {report.recommendations.map((rec: Recommendation, index) => (
        <RecommendationCard
          key={rec.id}
          recommendation={rec}
          index={index}
          isExpanded={expandedRecommendations.has(rec.id)}
          onToggle={() => toggleRecommendation(rec.id)}
        />
      ))}
    </div>
  );
};

const RecommendationCard: React.FC<{
  recommendation: Recommendation;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ recommendation, isExpanded, onToggle }) => {
  return (
    <div className="relative group">
      <motion.div
        className="relative rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-lg transition-all duration-200"
        layout
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              {recommendation.title}
            </h4>
            <span
              className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${
                recommendation.impact === "High"
                  ? "bg-red-500/20 text-red-400"
                  : recommendation.impact === "Medium"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-blue-500/20 text-blue-400"
              }
            `}
            >
              {recommendation.impact} Impact
            </span>
          </div>
          <span className="inline-block px-3 py-1 bg-gray-200 dark:bg-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-200">
            {recommendation.category}
          </span>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            {recommendation.description}
          </p>
          <motion.div
            className="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-4 transition-colors duration-200 cursor-pointer"
            onClick={onToggle}
          >
            <div className="flex justify-between items-center">
              <h5 className="font-semibold text-gray-900 dark:text-white">
                Implementation Steps
              </h5>
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            <AnimatePresence>
              {isExpanded && (
                <motion.ul
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-2 space-y-2"
                >
                  {recommendation.steps.map((step, stepIndex) => (
                    <motion.li
                      key={stepIndex}
                      className="flex items-start"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: stepIndex * 0.1 }}
                    >
                      <ChevronRight
                        className="mr-2 mt-1 text-blue-400 flex-shrink-0"
                        size={16}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {step}
                      </span>
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </motion.div>
          {recommendation.additionalContext && (
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              {recommendation.additionalContext}
            </p>
          )}
        </div>
      </motion.div>
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300 -z-10" />
    </div>
  );
};

export default SEODashboard;
