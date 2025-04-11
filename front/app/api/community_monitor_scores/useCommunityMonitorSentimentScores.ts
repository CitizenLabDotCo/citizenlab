import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import communityMonitorSentimentScoreKeys from './keys';
import {
  CommunityMonitorSentimentScoreKeys,
  ICommunityMonitorSentimentScores,
} from './types';

const fetchCommunityMonitorSentimentScores = (phaseId?: string) => {
  return fetcher<ICommunityMonitorSentimentScores>({
    path: `/phases/${phaseId}/sentiment_by_quarter`,
    action: 'get',
  });
};
const useCommunityMonitorSentimentScores = (phaseId?: string) => {
  return useQuery<
    ICommunityMonitorSentimentScores,
    CLErrors,
    ICommunityMonitorSentimentScores,
    CommunityMonitorSentimentScoreKeys
  >({
    queryKey: communityMonitorSentimentScoreKeys.all(),
    queryFn: () => fetchCommunityMonitorSentimentScores(phaseId),
  });
};

export default useCommunityMonitorSentimentScores;
