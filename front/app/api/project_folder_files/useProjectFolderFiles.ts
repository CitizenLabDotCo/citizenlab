import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import {
  IProjectFolderFiles,
  IQueryParameters,
  ProjectFolderFilesKeys,
} from './types';
import projectFolderFilesKeys from './keys';

const fetchProjectFolderFiles = (queryParameters: IQueryParameters) =>
  fetcher<IProjectFolderFiles>({
    path: `/project_folders/${queryParameters.projectFolderId}/files`,
    action: 'get',
  });

const useProjectFolderFiles = (queryParams: IQueryParameters) => {
  return useQuery<
    IProjectFolderFiles,
    CLErrors,
    IProjectFolderFiles,
    ProjectFolderFilesKeys
  >({
    queryKey: projectFolderFilesKeys.list(queryParams),
    queryFn: () => fetchProjectFolderFiles(queryParams),
  });
};

export default useProjectFolderFiles;
