import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import usersKeys from './keys';
import { IUser, UsersKeys } from './types';

const fetchUserById = ({ id }: { id?: string | null }) =>
  fetcher<IUser>({
    path: `/users/${id}`,
    action: 'get',
  });

const useUserById = (userId?: string | null) => {
  return useQuery<IUser, CLErrors, IUser, UsersKeys>({
    queryKey: usersKeys.item({ id: userId }),
    queryFn: () => fetchUserById({ id: userId }),
    enabled: !!userId,
  });
};

export default useUserById;
