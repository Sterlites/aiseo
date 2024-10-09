export interface SEOScore {
  score: number;
  penalties: string[];
  bonuses: string[];
}

export interface Recommendation {
  id: string;
  category: string;
  impact: string;
  title: string;
  description: string;
  steps: string[];
}

export interface SEOReport {
  url: string;
  overallScore: SEOScore;
  recommendations: Recommendation[];
}