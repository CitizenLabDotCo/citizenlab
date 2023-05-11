import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import projectFoldersKeys from './keys';
import { IProjectFolders, IQueryParameters, ProjectFoldersKeys } from './types';

const fetchProjectFolders = ({ ...queryParams }: IQueryParameters) =>
  fetcher<IProjectFolders>({
    path: `/project_folders`,
    action: 'get',
    queryParams: {
      ...queryParams,
    },
  });

const useProjectFolders = (queryParams: IQueryParameters) => {
  return useQuery<
    IProjectFolders,
    CLErrors,
    IProjectFolders,
    ProjectFoldersKeys
  >({
    queryKey: projectFoldersKeys.list(queryParams),
    queryFn: () => fetchProjectFolders(queryParams),
  });
};

export default useProjectFolders;
