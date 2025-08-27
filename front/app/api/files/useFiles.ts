import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import filesKeys from './keys';
import {
  FilesKeys,
  GetFilesParameters,
  IFiles,
  QueryParameters,
} from './types';

const fetchFiles = (queryParams: QueryParameters) =>
  fetcher<IFiles>({
    path: '/files',
    action: 'get',
    queryParams,
  });

const useFiles = ({
  pageNumber,
  pageSize,
  uploaderId,
  project,
  sort,
  search,
  deleted,
  excludeIdeaFiles,
  enabled = true,
}: GetFilesParameters) => {
  const queryParameters: QueryParameters = {
    'page[number]': pageNumber ?? 1,
    'page[size]': pageSize ?? 250,
    uploader_id: uploaderId,
    project: project?.length ? project : undefined,
    excluded_idea_files: excludeIdeaFiles,
    sort,
    search,
    deleted,
  };

  return useQuery<IFiles, CLErrors, IFiles, FilesKeys>({
    queryKey: filesKeys.list(queryParameters),
    queryFn: () => fetchFiles(queryParameters),
    enabled,
  });
};

export default useFiles;
