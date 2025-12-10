import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import {
  USE_DUMMY_VOTING_INSIGHTS_DATA,
  dummyVotingInsights,
  dummyVotingInsightsWithGender,
  dummyVotingInsightsWithAge,
  dummyVotingInsightsWithDomicile,
} from './dummyData';
import votingInsightsKeys from './keys';
import { VotingPhaseVotes, GroupByOption } from './types';

/**
 * Fetches Voting phase votes from the backend
 * Returns full JSONAPI response structure
 */
const fetchVotingPhaseVotes = ({
  phaseId,
  groupBy,
}: {
  phaseId: string;
  groupBy?: GroupByOption;
}) => {
  const params = new URLSearchParams();
  if (groupBy) params.append('group_by', groupBy);

  const queryString = params.toString();
  const path = `/phases/${phaseId}/insights/voting${
    queryString ? `?${queryString}` : ''
  }` as `/${string}`;

  return fetcher<VotingPhaseVotes>({
    path,
    action: 'get',
  });
};

/**
 * Returns dummy data based on groupBy parameter
 */
const getDummyVotingInsights = (groupBy?: GroupByOption): VotingPhaseVotes => {
  if (groupBy === 'gender')
    return dummyVotingInsightsWithGender as VotingPhaseVotes;
  if (groupBy === 'birthyear')
    return dummyVotingInsightsWithAge as VotingPhaseVotes;
  if (groupBy === 'domicile')
    return dummyVotingInsightsWithDomicile as VotingPhaseVotes;
  return dummyVotingInsights as VotingPhaseVotes;
};

interface UseVotingPhaseVotesParams {
  phaseId: string;
  groupBy?: GroupByOption;
  enabled?: boolean;
}

/**
 * Hook to fetch Voting phase votes insights
 * Returns standard React Query result with full JSONAPI structure
 * Access results via: data.data.attributes
 *
 * @param phaseId - Phase ID to fetch results for
 * @param groupBy - Demographic grouping option (gender, birthyear, domicile)
 * @param enabled - Whether the query should run (defaults to true if phaseId exists)
 */
const useVotingPhaseVotes = ({
  phaseId,
  groupBy,
  enabled = true,
}: UseVotingPhaseVotesParams) => {
  return useQuery<VotingPhaseVotes, CLErrors, VotingPhaseVotes>({
    queryKey: votingInsightsKeys.item({ phaseId, groupBy }),
    queryFn: () =>
      USE_DUMMY_VOTING_INSIGHTS_DATA
        ? getDummyVotingInsights(groupBy)
        : fetchVotingPhaseVotes({ phaseId, groupBy }),
    enabled: enabled && !!phaseId,
  });
};

export default useVotingPhaseVotes;
