import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IUsersByDomicile, UsersByDomicileKeys } from './types';
import usersByDomicileKeys from './keys';
import { ICustomFieldParams } from 'api/users_by_custom_field/types';

const fetchUsersByDomicile = (params: ICustomFieldParams) =>
  fetcher<IUsersByDomicile>({
    path: `/stats/users_by_domicile`,
    action: 'get',
    queryParams: params,
  });

const useUsersByDomicile = ({
  enabled,
  ...queryParameters
}: ICustomFieldParams & { enabled: boolean }) => {
  return useQuery<
    IUsersByDomicile,
    CLErrors,
    IUsersByDomicile,
    UsersByDomicileKeys
  >({
    queryKey: usersByDomicileKeys.item(queryParameters),
    queryFn: () => fetchUsersByDomicile(queryParameters),
    enabled,
  });
};

export default useUsersByDomicile;
