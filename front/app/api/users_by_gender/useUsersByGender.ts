import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { UsersByGenderKeys } from './types';
import usersByGenderKeys from './keys';
import {
  ICustomFieldParams,
  IUsersByCustomField,
} from 'api/users_by_custom_field/types';

const fetchUsersByGender = (params: ICustomFieldParams) =>
  fetcher<IUsersByCustomField>({
    path: `/stats/users_by_gender`,
    action: 'get',
    queryParams: params,
  });

const useUsersByGender = (queryParameters: ICustomFieldParams) => {
  return useQuery<
    IUsersByCustomField,
    CLErrors,
    IUsersByCustomField,
    UsersByGenderKeys
  >({
    queryKey: usersByGenderKeys.item(queryParameters),
    queryFn: () => fetchUsersByGender(queryParameters),
  });
};

export default useUsersByGender;
