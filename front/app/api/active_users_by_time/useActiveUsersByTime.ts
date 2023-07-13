import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import {
  IActiveUsersByTime,
  ActiveUsersByTimeKeys,
  IActiveUsersByTimeParams,
} from './types';
import activeUsersByTimeKeys from './keys';

const fetchActiveUsersByTime = (params: IActiveUsersByTimeParams) =>
  fetcher<IActiveUsersByTime>({
    path: `/stats/active_users_by_time`,
    action: 'get',
    queryParams: params,
  });

const useActiveUsersByTime = ({
  ...queryParameters
}: IActiveUsersByTimeParams) => {
  return useQuery<
    IActiveUsersByTime,
    CLErrors,
    IActiveUsersByTime,
    ActiveUsersByTimeKeys
  >({
    queryKey: activeUsersByTimeKeys.item(queryParameters),
    queryFn: () => fetchActiveUsersByTime(queryParameters),
  });
};

export default useActiveUsersByTime;
