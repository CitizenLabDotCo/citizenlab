import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IUsersByBirthyear, UsersByBirthyearKeys } from './types';
import usersByBirthyearKeys from './keys';
import { ICustomFieldParams } from 'api/users_by_custom_field/types';

const fetchUsersByBirthyear = (params: ICustomFieldParams) =>
  fetcher<IUsersByBirthyear>({
    path: `/stats/users_by_birthyear`,
    action: 'get',
    queryParams: params,
  });

const useUsersByBirthyear = ({
  enabled,
  ...queryParameters
}: ICustomFieldParams & { enabled: boolean }) => {
  return useQuery<
    IUsersByBirthyear,
    CLErrors,
    IUsersByBirthyear,
    UsersByBirthyearKeys
  >({
    queryKey: usersByBirthyearKeys.item(queryParameters),
    queryFn: () => fetchUsersByBirthyear(queryParameters),
    enabled,
  });
};

export default useUsersByBirthyear;
