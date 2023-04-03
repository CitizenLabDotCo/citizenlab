import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import initiativesKeys from './keys';
import { IInitiatives, IQueryParameters, InitiativesKeys } from './types';

export const defaultPageSize = 20;

const fetchInitiatives = ({
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

const useInitiatives = (queryParams: IQueryParameters) => {
  return useQuery<IInitiatives, CLErrors, IInitiatives, InitiativesKeys>({
    queryKey: initiativesKeys.list(queryParams),
    queryFn: () => fetchInitiatives(queryParams),
  });
};

export default useInitiatives;
