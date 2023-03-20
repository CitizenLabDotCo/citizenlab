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

const fetchInitiativeFilterCounts = ({ ...queryParams }: IQueryParameters) =>
  fetcher<IInitiativesFilterCounts>({
    path: `/initiatives/filter_counts`,
    action: 'get',
    queryParams: {
      ...queryParams,
      'page[number]': undefined,
      'page[size]': undefined,
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
