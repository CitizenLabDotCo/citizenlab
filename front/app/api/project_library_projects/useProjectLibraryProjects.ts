import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import projectLibraryProjectsKeys from './keys';
import {
  Parameters,
  ProjectLibraryProjects,
  ProjectLibraryProjectsKeys,
} from './types';

const fetchLibraryProjects = ({ ...queryParameters }) =>
  fetcher<ProjectLibraryProjects>({
    path: `/projects`,
    action: 'get',
    queryParams: {
      ...queryParameters,
      'page[size]': queryParameters['page[size]'] ?? 6,
      'page[number]': queryParameters['page[number]'] ?? 1,
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
