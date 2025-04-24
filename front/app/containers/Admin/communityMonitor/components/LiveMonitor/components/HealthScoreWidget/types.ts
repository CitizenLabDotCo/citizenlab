export type QuarterlyScores = {
  overallHealthScores: {
    period: string;
    score: number;
  }[];
  categoryHealthScores: {
    category: string;
    localizedLabel: string;
    scores: {
      period: string;
      score: number;
    }[];
  }[];
  totalHealthScoreCounts: {
    period: string;
    totals: {
      sentimentValue: string;
      count: number;
    }[];
  }[];
};
