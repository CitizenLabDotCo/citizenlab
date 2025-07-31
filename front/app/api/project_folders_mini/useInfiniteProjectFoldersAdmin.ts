import { useInfiniteQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import projectFoldersMiniKeys from './keys';
import { MiniProjectFolders, Parameters } from './types';

const DEFAULT_PAGE_SIZE = 10;

const fetchPage = async (
  params: Parameters,
  page: number,
  pageSize: number
): Promise<MiniProjectFolders> =>
  fetcher<MiniProjectFolders>({
    path: '/project_folders/for_admin',
    action: 'get',
    queryParams: {
      ...params,
      'page[number]': page,
      'page[size]': pageSize,
    },
  });

const useInfiniteProjectFoldersAdmin = (
  params: Omit<Parameters, 'page[number]' | 'page[size]'>,
  pageSize: number = DEFAULT_PAGE_SIZE
) =>
  useInfiniteQuery<MiniProjectFolders, CLErrors>(
    projectFoldersMiniKeys.list(params),
    ({ pageParam = 1 }) => fetchPage(params, pageParam, pageSize),
    {
      getNextPageParam: (lastPage) => {
        const nextLink = lastPage.links?.next;
        return nextLink ? getPageNumberFromUrl(nextLink) : undefined;
      },
    }
  );

export default useInfiniteProjectFoldersAdmin;
