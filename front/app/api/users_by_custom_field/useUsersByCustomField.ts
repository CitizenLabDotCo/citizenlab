import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import {
  ICustomFieldParams,
  IUsersByCustomField,
  UsersByCustomFieldKeys,
} from './types';
import usersByCustomFieldKeys from './keys';

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
  enabled,
  ...queryParameters
}: ICustomFieldParams & { id: string; enabled: boolean }) => {
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
