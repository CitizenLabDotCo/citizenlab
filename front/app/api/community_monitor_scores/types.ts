import { Keys } from 'utils/cl-react-query/types';

import communityMonitorSentimentScoreKeys from './keys';

export type YearAndQuarter = `${number}-${1 | 2 | 3 | 4}`; // E.g. "2025-1", "2025-2", etc.

type Multilocs = Record<string, Record<string, string>>;

export type TimePeriodAndScore = Record<YearAndQuarter, number>;

export type CategoryAverages = Record<string, TimePeriodAndScore>;

export type Categories = {
  averages: CategoryAverages;
  multilocs: Multilocs;
};

export type CommunityMonitorSentimentScoreAttributes = {
  categories?: Categories;
  overall?: {
    averages: TimePeriodAndScore;
    totals: Record<YearAndQuarter, Record<string, number>>; // E.g. {"2025-1": {"1": 3, "2": 4}}
  };
};

export type ICommunityMonitorSentimentScores = {
  data: {
    type: 'sentiment_by_quarter';
    attributes: CommunityMonitorSentimentScoreAttributes;
  };
};

export type CommunityMonitorSentimentScoreKeys = Keys<
  typeof communityMonitorSentimentScoreKeys
>;
