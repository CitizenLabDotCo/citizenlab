import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import miniProjectsKeys from './keys';
import { MiniProjects, MiniProjectsKeys, QueryParameters } from './types';

const fetchProjectsWithActiveParticipationPhase = (
  queryParameters: QueryParameters
) =>
  fetcher<MiniProjects>({
    path: '/projects/with_active_participation_phase',
    action: 'get',
    queryParams: {
      ...queryParameters,
    },
  });

const useProjectsWithActiveParticipationPhase = (
  queryParams: QueryParameters,
  { enabled = true }: { enabled: boolean } = { enabled: true }
) => {
  return useQuery<MiniProjects, CLErrors, MiniProjects, MiniProjectsKeys>({
    queryKey: miniProjectsKeys.list(queryParams),
    queryFn: () => fetchProjectsWithActiveParticipationPhase(queryParams),
    enabled,
  });
};

export default useProjectsWithActiveParticipationPhase;
