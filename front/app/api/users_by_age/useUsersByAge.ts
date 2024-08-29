import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { ICustomFieldParams } from 'api/users_by_custom_field/types';

import fetcher from 'utils/cl-react-query/fetcher';

import usersByAgeKeys from './keys';
import { IUsersByAge, UsersByAgeKeys } from './types';

const fetchUsersByAge = (params: ICustomFieldParams) =>
  fetcher<IUsersByAge>({
    path: `/stats/users_by_age`,
    action: 'get',
    queryParams: params,
  });

const useUsersByAge = ({
  enabled,
  ...queryParameters
}: ICustomFieldParams & { enabled: boolean }) => {
  return useQuery<IUsersByAge, CLErrors, IUsersByAge, UsersByAgeKeys>({
    queryKey: usersByAgeKeys.item(queryParameters),
    queryFn: () => fetchUsersByAge(queryParameters),
    enabled,
  });
};

export default useUsersByAge;
