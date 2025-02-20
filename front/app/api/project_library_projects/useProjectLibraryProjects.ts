import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import projectLibraryProjectsKeys from './keys';
import {
  Parameters,
  ProjectLibraryProjects,
  ProjectLibraryProjectsKeys,
} from './types';

const fetchLibraryProjects = (queryParams: Parameters) =>
  fetcher<ProjectLibraryProjects>({
    path: `/projects`,
    action: 'get',
    queryParams: {
      ...queryParams,
      'page[size]': queryParams['page[size]'] ?? 6,
      'page[number]': queryParams['page[number]'] ?? 1,
    },
    apiPath: '/project_library_api',
  });

const useProjectLibraryProjects = (queryParams: Parameters) => {
  return useQuery<
    ProjectLibraryProjects,
    CLErrors,
    ProjectLibraryProjects,
    ProjectLibraryProjectsKeys
  >({
    queryKey: projectLibraryProjectsKeys.list(queryParams),
    queryFn: () => fetchLibraryProjects(queryParams),
  });
};

export default useProjectLibraryProjects;
