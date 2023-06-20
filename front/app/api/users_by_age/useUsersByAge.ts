import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { ICustomFieldParams, IUsersByAge, UsersByAgeKeys } from './types';
import usersByAgeKeys from './keys';

const fetchUsersByAge = (params: ICustomFieldParams) =>
  fetcher<IUsersByAge>({
    path: `/stats/users_by_age`,
    action: 'get',
    queryParams: params,
  });

const useUsersByAge = (queryParameters: ICustomFieldParams) => {
  return useQuery<IUsersByAge, CLErrors, IUsersByAge, UsersByAgeKeys>({
    queryKey: usersByAgeKeys.item(queryParameters),
    queryFn: () => fetchUsersByAge(queryParameters),
  });
};

export default useUsersByAge;
