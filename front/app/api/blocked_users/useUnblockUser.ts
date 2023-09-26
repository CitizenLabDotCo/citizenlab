import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrorsWrapper } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import blockedUsersCountKeys from './keys';
import { IUser } from 'api/users/types';
import usersKeys from 'api/users/keys';

const unblockUser = async (userId: string) =>
  fetcher<IUser>({
    path: `/users/${userId}/unblock`,
    action: 'patch',
    body: {},
  });

const useUnblockUser = () => {
  const queryClient = useQueryClient();
  return useMutation<IUser, Error | CLErrorsWrapper, string>({
    mutationFn: unblockUser,
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

export default useUnblockUser;
