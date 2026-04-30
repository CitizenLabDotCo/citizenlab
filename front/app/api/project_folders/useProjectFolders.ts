import { useQuery } from '@tanstack/react-query';
import { CLErrors, Pagination } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import projectFoldersKeys from './keys';
import { IProjectFolders, ProjectFoldersKeys } from './types';

const fetchProjectFolders = ({ ...queryParams }: Pagination) =>
  fetcher<IProjectFolders>({
    path: `/project_folders`,
    action: 'get',
    queryParams: {
      ...queryParams,
    },
  });

const useProjectFolders = (queryParams: Pagination = {}, enabled = true) => {
  return useQuery<
    IProjectFolders,
    CLErrors,
    IProjectFolders,
    ProjectFoldersKeys
  >({
    queryKey: projectFoldersKeys.list(queryParams),
    queryFn: () => fetchProjectFolders(queryParams),
    enabled,
  });
};

export default useProjectFolders;
