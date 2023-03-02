import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import initiativesKeys from './keys';
import {
  IInitiativesFilterCounts,
  IQueryParameters,
  InitiativeFilterCountsKeys,
} from './types';

export const defaultPageSize = 12;

const fetchInitiativeFilterCounts = ({
  pageNumber,
  pageSize,
  ...queryParams
}: IQueryParameters) =>
  fetcher<IInitiativesFilterCounts>({
    path: `/initiatives/filter_counts`,
    action: 'get',
    queryParams: {
      'page[number]': pageNumber || 1,
      'page[size]': pageSize || defaultPageSize,
      ...queryParams,
    },
  });

const useInitiativesFilterCounts = (queryParams: IQueryParameters) => {
  return useQuery<
    IInitiativesFilterCounts,
    CLErrors,
    IInitiativesFilterCounts,
    InitiativeFilterCountsKeys
  >({
    queryKey: initiativesKeys.item(queryParams),
    queryFn: () => fetchInitiativeFilterCounts(queryParams),
  });
};

export default useInitiativesFilterCounts;
