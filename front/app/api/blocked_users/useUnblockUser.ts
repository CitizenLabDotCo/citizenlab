import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrorsJSON } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import blockedUsersCountKeys from './keys';
import { IUser } from 'services/users';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';

const unblockUser = async (userId: string) =>
  fetcher<IUser>({
    path: `/users/${userId}/unblock`,
    action: 'patch',
    body: {},
  });

const useUnblockUser = () => {
  const queryClient = useQueryClient();
  return useMutation<IUser, Error | CLErrorsJSON, string>({
    mutationFn: unblockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: blockedUsersCountKeys.items(),
      });
      streams.fetchAllWith({
        apiEndpoint: [`${API_PATH}/users`],
        partialApiEndpoint: ['users/by_slug'],
      });
    },
  });
};

export default useUnblockUser;
