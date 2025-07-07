import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import filesKeys from './keys';
import { FilesKeys, IFiles, IPaginationProps, QueryParameters } from './types';

const fetchFiles = (queryParams: QueryParameters) =>
  fetcher<IFiles>({
    path: '/files',
    action: 'get',
    queryParams,
  });

const useFiles = (
  { pageNumber, pageSize, ...params }: QueryParameters & IPaginationProps,
  { enabled = true }: { enabled?: boolean } = { enabled: true }
) => {
  const queryParameters: QueryParameters = {
    'page[number]': pageNumber ?? 1,
    'page[size]': pageSize ?? 250,
    ...params,
  };

  return useQuery<IFiles, CLErrors, IFiles, FilesKeys>({
    queryKey: filesKeys.list(queryParameters),
    queryFn: () => fetchFiles(queryParameters),
    enabled,
  });
};

export default useFiles;
