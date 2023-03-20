import { useInfiniteQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { getPageNumberFromUrl } from 'utils/paginationUtils';
import inputsKeys from './keys';
import { IInitiatives, IQueryParameters, InitiativesKeys } from './types';

const defaultPageSize = 12;

const fetchInfiniteInputs = ({
  pageNumber,
  pageSize,
  ...queryParams
}: IQueryParameters) =>
  fetcher<IInitiatives>({
    path: `/initiatives`,
    action: 'get',
    queryParams: {
      'page[number]': pageNumber || 1,
      'page[size]': pageSize || defaultPageSize,
      ...queryParams,
    },
  });

const useInfitineInitiatives = (queryParams: IQueryParameters) => {
  return useInfiniteQuery<
    IInitiatives,
    CLErrors,
    IInitiatives,
    InitiativesKeys
  >({
    queryKey: inputsKeys.list(queryParams),
    queryFn: ({ pageParam }) =>
      fetchInfiniteInputs({ ...queryParams, pageNumber: pageParam }),
    getNextPageParam: (lastPage) => {
      const hasNextPage = lastPage.links?.next;
      const pageNumber = getPageNumberFromUrl(lastPage.links.self);
      return hasNextPage && pageNumber ? pageNumber + 1 : null;
    },
  });
};

export default useInfitineInitiatives;
