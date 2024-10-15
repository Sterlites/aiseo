// ../types.ts

export interface DetailedSEOScore {
  score: number;
  category: string;
  details: {
    value: string | number;
    impact: 'positive' | 'negative' | 'neutral';
    context?: string;
  };
}

export interface Recommendation {
  id: string;
  category: string;
  impact: 'High' | 'Medium';
  title: string;
  description: string;
  steps: string[];
  additionalContext: string;
}

export interface EnhancedSEOReport {
  url: string;
  overallScore: {
    score: number;
    interpretation: string;
    penalties: string[];
    bonuses: string[];
  };
  score: number;
  interpretation: string;
  penalties: string[];
  bonuses: string[];
  detailedScores: {
    titleScore: DetailedSEOScore;
    metaDescriptionScore: DetailedSEOScore;
    headingsScore: DetailedSEOScore;
    imageOptimizationScore: DetailedSEOScore;
    contentScore: DetailedSEOScore;
    technicalScore: DetailedSEOScore;
    mobileFriendlinessScore: DetailedSEOScore;
    linkingStructureScore: DetailedSEOScore;
  };
  titleScore: DetailedSEOScore;
  metaDescriptionScore: DetailedSEOScore;
  headingsScore: DetailedSEOScore;
  imageOptimizationScore: DetailedSEOScore;
  contentScore: DetailedSEOScore;
  technicalScore: DetailedSEOScore;
  mobileFriendlinessScore: DetailedSEOScore;
  linkingStructureScore: DetailedSEOScore;
  recommendations: Recommendation[];
}