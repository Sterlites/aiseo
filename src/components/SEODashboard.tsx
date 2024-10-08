import React from 'react';
import { SEOReport, Recommendation } from '../types';
import { AlertTriangle, CheckCircle, ChevronRight, ExternalLink } from 'lucide-react';

interface SEODashboardProps {
  report: SEOReport;
}

const SEODashboard: React.FC<SEODashboardProps> = ({ report }) => {
  return (
    <div className="w-full max-w-4xl">
      {/* URL and Score Header */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">SEO Analysis</h2>
              <a 
                href={report.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-white/80 hover:text-white transition-colors"
              >
                {report.url} <ExternalLink size={16} className="ml-1" />
              </a>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-1">{report.overallScore.score}</div>
              <div className="text-white/80">SEO Score</div>
            </div>
          </div>
        </div>
        
        {/* Score Visualization */}
        <div className="p-6">
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${report.overallScore.score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Penalties and Bonuses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Penalties */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h3 className="flex items-center text-lg font-semibold mb-4 text-orange-500">
              <AlertTriangle className="mr-2" />
              Areas for Improvement
            </h3>
            <ul className="space-y-2">
              {report.overallScore.penalties.map((penalty, index) => (
                <li key={index} className="flex items-start">
                  <ChevronRight className="mr-2 mt-1 text-orange-400" size={16} />
                  <span className="text-gray-700">{penalty}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bonuses */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h3 className="flex items-center text-lg font-semibold mb-4 text-green-500">
              <CheckCircle className="mr-2" />
              Positive Aspects
            </h3>
            <ul className="space-y-2">
              {report.overallScore.bonuses.map((bonus, index) => (
                <li key={index} className="flex items-start">
                  <ChevronRight className="mr-2 mt-1 text-green-400" size={16} />
                  <span className="text-gray-700">{bonus}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-800">Detailed Recommendations</h3>
        {report.recommendations.map((rec: Recommendation) => (
          <div key={rec.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800">{rec.title}</h4>
                <span className={`
                  px-3 py-1 rounded-full text-sm font-medium
                  ${rec.impact === 'High' ? 'bg-red-100 text-red-800' :
                    rec.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'}
                `}>
                  {rec.impact} Impact
                </span>
              </div>
              <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600 mb-4">
                {rec.category}
              </span>
              <p className="text-gray-600 mb-4">{rec.description}</p>
              <div className="bg-gray-50 rounded-xl p-4">
                <h5 className="font-semibold text-gray-700 mb-2">Implementation Steps</h5>
                <ul className="space-y-2">
                  {rec.steps.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <ChevronRight className="mr-2 mt-1 text-blue-400" size={16} />
                      <span className="text-gray-600">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SEODashboard;