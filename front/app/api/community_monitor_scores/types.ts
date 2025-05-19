import { Locale } from '@citizenlab/cl2-component-library';

import { Keys } from 'utils/cl-react-query/types';

import communityMonitorSentimentScoreKeys from './keys';

// YearAndQuarter:
// E.g. "2025-1", "2025-2", etc.
export type YearAndQuarter = `${number}-${1 | 2 | 3 | 4}`;

type CategoryLabelMultilocs = Record<Category, Record<Locale, string>>;

export type TimePeriodAndScore = Record<YearAndQuarter, number>;

export type Category =
  | 'quality_of_life'
  | 'service_delivery'
  | 'governance_and_trust'
  | 'other';

export type CategoryAverages = Record<Category, TimePeriodAndScore>;

export type CategoryScores = {
  averages: CategoryAverages;
  multilocs: CategoryLabelMultilocs;
};

export type CommunityMonitorSentimentScoreAttributes = {
  categories?: CategoryScores;
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
