import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import projectLibraryPhasesKeys from './keys';
import { ProjectLibraryPhase, ProjectLibraryPhasesKeys } from './types';

export const fetchProjectLibraryPhase = (id?: string) =>
  fetcher<ProjectLibraryPhase>({
    path: `/phases/${id}`,
    action: 'get',
    apiPath: '/project_library_api',
  });

const useProjectLibraryPhase = (id: string | undefined) => {
  return useQuery<
    ProjectLibraryPhase,
    CLErrors,
    ProjectLibraryPhase,
    ProjectLibraryPhasesKeys
  >({
    queryKey: projectLibraryPhasesKeys.item({ id }),
    queryFn: () => fetchProjectLibraryPhase(id),
    enabled: !!id,
  });
};

export default useProjectLibraryPhase;
