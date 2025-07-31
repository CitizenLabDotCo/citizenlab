import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import participantCountKeys from './keys';
import { ParticipantCounts, ParticipantCountsKeys } from './types';

const fetchParticipantCounts = async (projectIds: string[]) => {
  return fetcher<ParticipantCounts>({
    path: '/projects/participant_counts',
    action: 'get',
    queryParams: {
      project_ids: projectIds,
    },
  });
};

const useParticipantCounts = (projectIds: string[]) => {
  return useQuery<
    ParticipantCounts,
    CLErrors,
    ParticipantCounts,
    ParticipantCountsKeys
  >({
    queryKey: participantCountKeys.list({ project_ids: projectIds }),
    queryFn: () => fetchParticipantCounts(projectIds),
    enabled: projectIds.length > 0,
  });
};

export default useParticipantCounts;
