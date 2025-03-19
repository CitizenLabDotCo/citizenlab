import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'community_monitor_sentiment_scores',
};

const communityMonitorSentimentScoreKeys = {
  all: () => [baseKey],
} satisfies QueryKeys;

export default communityMonitorSentimentScoreKeys;
