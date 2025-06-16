import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import projectFoldersKeys from './keys';
import { IProjectFolders, AdminParameters, ProjectFoldersKeys } from './types';

const fetchProjectFoldersAdmin = (queryParams: AdminParameters) =>
  fetcher<IProjectFolders>({
    path: `/project_folders/for_admin`,
    action: 'get',
    queryParams: {
      ...queryParams,
      'page[number]': queryParams['page[number]'] ?? 1,
      'page[size]': queryParams['page[size]'] ?? 10,
    },
  });

const useProjectFoldersAdmin = (queryParams: AdminParameters) => {
  return useQuery<
    IProjectFolders,
    CLErrors,
    IProjectFolders,
    ProjectFoldersKeys
  >({
    queryKey: projectFoldersKeys.list({ ...queryParams, admin: true }),
    queryFn: () => fetchProjectFoldersAdmin(queryParams),
  });
};

export default useProjectFoldersAdmin;
