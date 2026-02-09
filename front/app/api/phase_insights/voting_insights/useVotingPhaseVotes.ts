import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import votingInsightsKeys from './keys';
import { VotingPhaseVotes, DemographicFieldKey } from './types';

const fetchVotingPhaseVotes = async ({
  phaseId,
  groupBy,
}: {
  phaseId: string;
  groupBy?: DemographicFieldKey;
}): Promise<VotingPhaseVotes> => {
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

interface UseVotingPhaseVotesParams {
  phaseId: string;
  groupBy?: DemographicFieldKey;
  enabled?: boolean;
}

const useVotingPhaseVotes = ({
  phaseId,
  groupBy,
  enabled = true,
}: UseVotingPhaseVotesParams) => {
  return useQuery<VotingPhaseVotes, CLErrors, VotingPhaseVotes>({
    queryKey: votingInsightsKeys.item({ phaseId, groupBy }),
    queryFn: () => fetchVotingPhaseVotes({ phaseId, groupBy }),
    enabled: enabled && !!phaseId,
  });
};

export default useVotingPhaseVotes;
