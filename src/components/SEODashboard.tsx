import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, ChevronRight, ExternalLink, ArrowUpRight } from 'lucide-react';
import { SEOReport, Recommendation } from '../types';

interface SEODashboardProps {
  report: SEOReport;
}

const SEODashboard: React.FC<SEODashboardProps> = ({ report }) => {
  return (
    <motion.div 
      className="w-full max-w-4xl mx-auto space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Score Card */}
      <motion.div 
        className="relative group"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
        <div className="relative rounded-2xl overflow-hidden bg-white/5 dark:bg-gray-900 backdrop-blur-sm transition-colors duration-200">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">SEO Analysis Results</h2>
                <a 
                  href={report.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {report.url} <ExternalLink size={16} className="ml-1" />
                </a>
              </div>
              <motion.div 
                className="text-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <div className="text-6xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  {report.overallScore.score}
                </div>
                <div className="text-gray-600 dark:text-gray-400">SEO Score</div>
              </motion.div>
            </div>
            
            <div className="relative h-4 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden transition-colors duration-200">
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

      {/* Penalties and Bonuses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatedCard
          title="Areas for Improvement"
          icon={<AlertTriangle className="text-orange-400" />}
          items={report.overallScore.penalties}
          colorClass="from-orange-600/20 to-red-600/20"
        />
        <AnimatedCard
          title="Positive Aspects"
          icon={<CheckCircle className="text-emerald-400" />}
          items={report.overallScore.bonuses}
          colorClass="from-emerald-600/20 to-teal-600/20"
        />
      </div>

      {/* Recommendations */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Detailed Recommendations</h3>
        {report.recommendations.map((rec: Recommendation, index) => (
          <RecommendationCard key={rec.id} recommendation={rec} index={index} />
        ))}
      </div>
    </motion.div>
  );
};

const AnimatedCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  items: string[];
  colorClass: string;
}> = ({ title, icon, items, colorClass }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
              <ArrowUpRight className="mr-2 mt-1 text-gray-500 dark:text-gray-400" size={16} />
              <span className="text-gray-700 dark:text-gray-300">{item}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

const RecommendationCard: React.FC<{
  recommendation: Recommendation;
  index: number;
}> = ({ recommendation, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      <div
        ref={shadowRef}
        className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"
      />
      <div
        ref={cardRef}
        className="relative rounded-2xl p-6 bg-white/5 dark:bg-gray-900 backdrop-blur-sm transition-colors duration-200"
      >
        <div className="flex items-start justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{recommendation.title}</h4>
          <span className={`
            px-3 py-1 rounded-full text-sm font-medium
            ${recommendation.impact === 'High' ? 'bg-red-500/20 text-red-400' :
              recommendation.impact === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-blue-500/20 text-blue-400'}
          `}>
            {recommendation.impact} Impact
          </span>
        </div>
        <span className="inline-block px-3 py-1 bg-gray-200 dark:bg-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-200">
          {recommendation.category}
        </span>
        <p className="text-gray-700 dark:text-gray-300 mb-4">{recommendation.description}</p>
        <div className="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-4 transition-colors duration-200">
          <h5 className="font-semibold mb-2 text-gray-900 dark:text-white">Implementation Steps</h5>
          <ul className="space-y-2">
            {recommendation.steps.map((step, stepIndex) => (
              <motion.li
                key={stepIndex}
                className="flex items-start"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: stepIndex * 0.1 }}
              >
                <ChevronRight className="mr-2 mt-1 text-blue-400" size={16} />
                <span className="text-gray-600 dark:text-gray-400">{step}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default SEODashboard;