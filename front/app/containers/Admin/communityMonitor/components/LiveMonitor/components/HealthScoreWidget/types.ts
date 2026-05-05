export const quarters = ['1', '2', '3', '4'] as const;
export type Quarter = (typeof quarters)[number];

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
