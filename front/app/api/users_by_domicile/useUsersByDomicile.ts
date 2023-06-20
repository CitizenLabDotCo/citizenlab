import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import {
  ICustomFieldParams,
  IUsersByDomicile,
  UsersByDomicileKeys,
} from './types';
import usersByDomicileKeys from './keys';

const fetchUsersByDomicile = (params: ICustomFieldParams) =>
  fetcher<IUsersByDomicile>({
    path: `/stats/users_by_domicile`,
    action: 'get',
    queryParams: params,
  });

const useUsersByDomicile = (queryParameters: ICustomFieldParams) => {
  return useQuery<
    IUsersByDomicile,
    CLErrors,
    IUsersByDomicile,
    UsersByDomicileKeys
  >({
    queryKey: usersByDomicileKeys.item(queryParameters),
    queryFn: () => fetchUsersByDomicile(queryParameters),
  });
};

export default useUsersByDomicile;
