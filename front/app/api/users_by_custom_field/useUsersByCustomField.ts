import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import usersByCustomFieldKeys from './keys';
import {
  ICustomFieldParams,
  IUsersByCustomField,
  UsersByCustomFieldKeys,
} from './types';

const fetchUsersByCustomField = ({
  id,
  ...params
}: ICustomFieldParams & { id: string }) =>
  fetcher<IUsersByCustomField>({
    path: `/stats/users_by_custom_field/${id}`,
    action: 'get',
    queryParams: params,
  });

const useUsersByCustomField = ({
  enabled = true,
  ...queryParameters
}: ICustomFieldParams & { id: string; enabled?: boolean }) => {
  return useQuery<
    IUsersByCustomField,
    CLErrors,
    IUsersByCustomField,
    UsersByCustomFieldKeys
  >({
    queryKey: usersByCustomFieldKeys.item(queryParameters),
    queryFn: () => fetchUsersByCustomField(queryParameters),
    enabled,
  });
};

export default useUsersByCustomField;
