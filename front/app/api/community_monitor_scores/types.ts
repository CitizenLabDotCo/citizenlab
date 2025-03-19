import { Keys } from 'utils/cl-react-query/types';

import communityMonitorSentimentScoreKeys from './keys';

type Quarter = `${number}-${1 | 2 | 3 | 4}`; // E.g. "2025-1", "2025-2", etc.
export type QuarterScores = Record<Quarter, number>;

export type CategoryAverages = Record<string, Record<Quarter, number>>;
type Multilocs = Record<string, Record<string, string>>;

export type Categories = {
  averages: CategoryAverages;
  multilocs: Multilocs;
};

export type ICommunityMonitorSentimentScores = {
  data: {
    type: 'community_monitor_sentiment_score';
    attributes: {
      overall?: QuarterScores;
      categories?: Categories;
    };
  };
};

export type CommunityMonitorSentimentScoreKeys = Keys<
  typeof communityMonitorSentimentScoreKeys
>;
