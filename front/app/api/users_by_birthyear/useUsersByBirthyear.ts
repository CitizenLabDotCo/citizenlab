import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import {
  ICustomFieldParams,
  IUsersByBirthyear,
  UsersByBirthyearKeys,
} from './types';
import usersByBirthyearKeys from './keys';

const fetchUsersByBirthyear = (params: ICustomFieldParams) =>
  fetcher<IUsersByBirthyear>({
    path: `/stats/users_by_birthyear`,
    action: 'get',
    queryParams: params,
  });

const useUsersByBirthyear = (queryParameters: ICustomFieldParams) => {
  return useQuery<
    IUsersByBirthyear,
    CLErrors,
    IUsersByBirthyear,
    UsersByBirthyearKeys
  >({
    queryKey: usersByBirthyearKeys.item(queryParameters),
    queryFn: () => fetchUsersByBirthyear(queryParameters),
  });
};

export default useUsersByBirthyear;
