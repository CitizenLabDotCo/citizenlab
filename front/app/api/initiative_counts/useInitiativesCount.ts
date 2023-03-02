import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import initiativesCountKeys from './keys';
import {
  InitiativesCountKeys,
  IQueryParameters,
  IInitiativesCount,
} from './types';

const fetchInitiativesCount = (queryParams: IQueryParameters) =>
  fetcher<IInitiativesCount>({
    path: `/initiatives_count`,
    action: 'get',
    queryParams,
  });

const useInitiativesCount = (queryParams: IQueryParameters) => {
  return useQuery<
    IInitiativesCount,
    CLErrors,
    IInitiativesCount,
    InitiativesCountKeys
  >({
    queryKey: initiativesCountKeys.item(queryParams),
    queryFn: () => fetchInitiativesCount(queryParams),
  });
};

export default useInitiativesCount;
