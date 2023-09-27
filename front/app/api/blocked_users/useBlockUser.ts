import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrorsWrapper } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IBlockUser } from './types';
import blockedUsersCountKeys from './keys';
import { IUser } from 'api/users/types';
import usersKeys from 'api/users/keys';

const blockUser = async ({ userId, reason }: IBlockUser) => {
  return fetcher<IUser>({
    path: `/users/${userId}/block`,
    action: 'patch',
    body: { block_reason: reason },
  });
};

const useBlockUser = () => {
  const queryClient = useQueryClient();
  return useMutation<IUser, Error | CLErrorsWrapper, IBlockUser>({
    mutationFn: blockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: blockedUsersCountKeys.items(),
      });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: usersKeys.items(),
      });
    },
  });
};

export default useBlockUser;
