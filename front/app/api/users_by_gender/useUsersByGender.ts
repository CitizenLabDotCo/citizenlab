import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import {
  ICustomFieldParams,
  IUsersByRegistrationField,
  UsersByGenderKeys,
} from './types';
import usersByGenderKeys from './keys';

const fetchUsersByGender = (params: ICustomFieldParams) =>
  fetcher<IUsersByRegistrationField>({
    path: `/stats/users_by_gender`,
    action: 'get',
    queryParams: params,
  });

const useUsersByGender = (queryParameters: ICustomFieldParams) => {
  return useQuery<
    IUsersByRegistrationField,
    CLErrors,
    IUsersByRegistrationField,
    UsersByGenderKeys
  >({
    queryKey: usersByGenderKeys.item(queryParameters),
    queryFn: () => fetchUsersByGender(queryParameters),
  });
};

export default useUsersByGender;
