import { Keys } from 'utils/cl-react-query/types';

import communityMonitorSentimentScoreKeys from './keys';

type YearAndQuarter = `${number}-${1 | 2 | 3 | 4}`; // E.g. "2025-1", "2025-2", etc.

type Multilocs = Record<string, Record<string, string>>;

export type QuarterScores = Record<YearAndQuarter, number>;

export type CategoryAverages = Record<string, Record<YearAndQuarter, number>>;

export type Categories = {
  averages: CategoryAverages;
  multilocs: Multilocs;
};

export type ICommunityMonitorSentimentScores = {
  data: {
    type: 'sentiment_by_quarter';
    attributes: {
      overall?: QuarterScores;
      categories?: Categories;
    };
  };
};

export type CommunityMonitorSentimentScoreKeys = Keys<
  typeof communityMonitorSentimentScoreKeys
>;
