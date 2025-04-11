import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'sentiment_by_quarter',
};

const communityMonitorSentimentScoreKeys = {
  all: () => [baseKey],
} satisfies QueryKeys;

export default communityMonitorSentimentScoreKeys;
