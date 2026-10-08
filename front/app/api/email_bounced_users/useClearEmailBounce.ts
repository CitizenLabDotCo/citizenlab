import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrorsWrapper } from 'typings';

import usersKeys from 'api/users/keys';
import { IUser } from 'api/users/types';

import fetcher from 'utils/cl-react-query/fetcher';

import emailBouncedUsersCountKeys from './keys';

const clearEmailBounce = async (userId: string) =>
  fetcher<IUser>({
    path: `/users/${userId}/clear_email_bounce`,
    action: 'patch',
    body: {},
  });

const useClearEmailBounce = () => {
  const queryClient = useQueryClient();
  return useMutation<IUser, Error | CLErrorsWrapper, string>({
    mutationFn: clearEmailBounce,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: emailBouncedUsersCountKeys.items(),
      });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: usersKeys.items(),
      });
    },
  });
};

export default useClearEmailBounce;
