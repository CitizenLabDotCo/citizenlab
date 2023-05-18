import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrorsJSON } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IUser, IUserUpdate } from './types';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';
import usersKeys from './keys';
import invalidateSeatsCache from 'api/seats/invalidateSeatsCache';
import requirementsKeys from 'api/authentication/authentication_requirements/keys';
import groupsKeys from 'api/groups/keys';
import userCountKeys from 'api/users_count/keys';

export const updateUser = async ({ userId, ...requestBody }: IUserUpdate) =>
  fetcher<IUser>({
    path: `/users/${userId}`,
    action: 'patch',
    body: { user: { ...requestBody } },
  });

const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<IUser, CLErrorsJSON, IUserUpdate>({
    mutationFn: updateUser,
    onSuccess: async (_data, variables) => {
      await streams.fetchAllWith({
        apiEndpoint: [`${API_PATH}/users/me`],
      });

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
    },
  });
};

export default useUpdateUser;
