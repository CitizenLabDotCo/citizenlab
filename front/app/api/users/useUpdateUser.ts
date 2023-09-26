import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrorsWrapper } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IUser, IUserUpdate } from './types';
import usersKeys from './keys';
import invalidateSeatsCache from 'api/seats/invalidateSeatsCache';
import requirementsKeys from 'api/authentication/authentication_requirements/keys';
import groupsKeys from 'api/groups/keys';
import userCountKeys from 'api/users_count/keys';
import meKeys from 'api/me/keys';

export const updateUser = async ({ userId, ...requestBody }: IUserUpdate) =>
  fetcher<IUser>({
    path: `/users/${userId}`,
    action: 'patch',
    body: { user: { ...requestBody } },
  });

const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<IUser, CLErrorsWrapper, IUserUpdate>({
    mutationFn: updateUser,
    onSuccess: async (_data, variables) => {
      // Invalidate seats if the user's roles have changed
      if (variables.roles) {
        invalidateSeatsCache();
      }

      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: groupsKeys.all() });
      queryClient.invalidateQueries({ queryKey: requirementsKeys.all() });
      queryClient.invalidateQueries({
        queryKey: userCountKeys.items(),
      });
      queryClient.invalidateQueries({ queryKey: meKeys.all() });
    },
  });
};

export default useUpdateUser;
