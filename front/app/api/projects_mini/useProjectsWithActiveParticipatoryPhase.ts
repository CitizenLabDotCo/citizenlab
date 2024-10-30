import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import miniProjectsKeys from './keys';
import { MiniProjects, MiniProjectsKeys, QueryParameters } from './types';

const fetchProjectsWithActiveParticipatoryPhase = (
  queryParameters: QueryParameters
) =>
  fetcher<MiniProjects>({
    path: '/projects/with_active_participatory_phase',
    action: 'get',
    queryParams: {
      'page[size]': queryParameters['page[size]'] ?? 6,
      'page[number]': queryParameters['page[number]'] ?? 1,
    },
  });

const useProjectsWithActiveParticipatoryPhase = (
  queryParams: QueryParameters = {},
  { enabled = true }: { enabled: boolean } = { enabled: true }
) => {
  return useQuery<MiniProjects, CLErrors, MiniProjects, MiniProjectsKeys>({
    queryKey: miniProjectsKeys.list(queryParams),
    queryFn: () => fetchProjectsWithActiveParticipatoryPhase(queryParams),
    enabled,
  });
};

export default useProjectsWithActiveParticipatoryPhase;
