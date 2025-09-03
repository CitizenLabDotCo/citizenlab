import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import projectLibraryProjectsKeys from './keys';
import { ProjectLibraryProject, ProjectLibraryProjectsKeys } from './types';

const fetchLibraryProject = (id?: string) =>
  fetcher<ProjectLibraryProject>({
    path: `/projects/${id}`,
    action: 'get',
    apiPath: '/project_library_api',
  });

const useProjectLibraryProject = (id?: string) => {
  return useQuery<
    ProjectLibraryProject,
    CLErrors,
    ProjectLibraryProject,
    ProjectLibraryProjectsKeys
  >({
    queryKey: projectLibraryProjectsKeys.item({ id }),
    queryFn: () => fetchLibraryProject(id),
    enabled: !!id,
  });
};

export default useProjectLibraryProject;
