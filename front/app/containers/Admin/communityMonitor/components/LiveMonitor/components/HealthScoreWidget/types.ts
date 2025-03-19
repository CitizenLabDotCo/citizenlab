export type Score = {
  period: string;
  score: any;
};

export type CategoryScore = {
  category: string;
  score: Score[];
  label: string;
};

export type OverallScores =
  | {
      period: string;
      score: any;
    }[]
  | undefined;

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
};
