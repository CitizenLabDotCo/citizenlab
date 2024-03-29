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
    path: `/stats/initiatives_count`,
    action: 'get',
    queryParams,
  });

const useInitiativesCount = (queryParams: IQueryParameters, enabled = true) => {
  return useQuery<
    IInitiativesCount,
    CLErrors,
    IInitiativesCount,
    InitiativesCountKeys
  >({
    queryKey: initiativesCountKeys.item(queryParams),
    queryFn: () => fetchInitiativesCount(queryParams),
    enabled,
  });
};

export default useInitiativesCount;
