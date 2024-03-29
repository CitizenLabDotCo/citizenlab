import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import {
  ICustomFieldParams,
  IUsersByCustomField,
} from 'api/users_by_custom_field/types';

import fetcher from 'utils/cl-react-query/fetcher';

import usersByGenderKeys from './keys';
import { UsersByGenderKeys } from './types';

const fetchUsersByGender = (params: ICustomFieldParams) =>
  fetcher<IUsersByCustomField>({
    path: `/stats/users_by_gender`,
    action: 'get',
    queryParams: params,
  });

const useUsersByGender = ({
  enabled,
  ...queryParameters
}: ICustomFieldParams & { enabled: boolean }) => {
  return useQuery<
    IUsersByCustomField,
    CLErrors,
    IUsersByCustomField,
    UsersByGenderKeys
  >({
    queryKey: usersByGenderKeys.item(queryParameters),
    queryFn: () => fetchUsersByGender(queryParameters),
    enabled,
  });
};

export default useUsersByGender;
