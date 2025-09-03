import { useInfiniteQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import useLocale from 'hooks/useLocale';

import fetcher from 'utils/cl-react-query/fetcher';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import miniProjectsKeys from './keys';
import { ProjectsMiniAdmin, Parameters } from './types';

const DEFAULT_PAGE_SIZE = 10;

const fetchPage = async (
  params: Parameters,
  page: number,
  pageSize: number
): Promise<ProjectsMiniAdmin> => {
  return fetcher<ProjectsMiniAdmin>({
    path: '/projects/for_admin',
    action: 'get',
    queryParams: {
      ...params,
      'page[number]': page,
      'page[size]': pageSize,
    },
  });
};

const useInfiniteProjectsMiniAdmin = (
  params: Omit<Parameters, 'page[number]' | 'page[size]' | 'locale'>,
  pageSize: number = DEFAULT_PAGE_SIZE
) => {
  const locale = useLocale();
  const paramsWithLocale = { ...params, locale };

  return useInfiniteQuery<ProjectsMiniAdmin, CLErrors>(
    miniProjectsKeys.list(paramsWithLocale),
    ({ pageParam = 1 }) => fetchPage(paramsWithLocale, pageParam, pageSize),
    {
      getNextPageParam: (lastPage) => {
        const nextLink = lastPage.links.next;
        return nextLink ? getPageNumberFromUrl(nextLink) : undefined;
      },
    }
  );
};

export default useInfiniteProjectsMiniAdmin;
