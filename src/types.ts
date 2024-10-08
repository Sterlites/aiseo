export interface SEOScore {
  score: number;
  penalties: string[];
  bonuses: string[];
}

export interface Recommendation {
  id: string;
  category: string;
  impact: 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  steps: string[];
}

export interface SEOReport {
  url: string;
  overallScore: SEOScore;
  recommendations: Recommendation[];
}