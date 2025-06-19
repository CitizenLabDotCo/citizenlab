import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import projectFoldersMiniKeys from './keys';
import {
  Parameters,
  ProjectFoldersMiniKeys,
  MiniProjectFolders,
} from './types';

const fetchProjectFoldersAdmin = (queryParams: Parameters) =>
  fetcher<MiniProjectFolders>({
    path: `/project_folders/for_admin`,
    action: 'get',
    queryParams: {
      ...queryParams,
      'page[number]': queryParams['page[number]'] ?? 1,
      'page[size]': queryParams['page[size]'] ?? 10,
    },
  });

const useProjectFoldersAdmin = (queryParams: Parameters) => {
  return useQuery<
    MiniProjectFolders,
    CLErrors,
    MiniProjectFolders,
    ProjectFoldersMiniKeys
  >({
    queryKey: projectFoldersMiniKeys.list(queryParams),
    queryFn: () => fetchProjectFoldersAdmin(queryParams),
  });
};

export default useProjectFoldersAdmin;
