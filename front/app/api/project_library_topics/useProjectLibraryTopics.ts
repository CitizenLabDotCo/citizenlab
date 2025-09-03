import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import projectLibraryTopicsKeys from './keys';
import { ProjectLibraryTopics, ProjectLibraryTopicsKeys } from './types';

const fetchProjectLibraryTopics = () =>
  fetcher<ProjectLibraryTopics>({
    path: `/topics`,
    action: 'get',
    apiPath: '/project_library_api',
  });

const useProjectLibraryTopics = () => {
  return useQuery<
    ProjectLibraryTopics,
    CLErrors,
    ProjectLibraryTopics,
    ProjectLibraryTopicsKeys
  >({
    queryKey: projectLibraryTopicsKeys.list(),
    queryFn: () => fetchProjectLibraryTopics(),
  });
};

export default useProjectLibraryTopics;
