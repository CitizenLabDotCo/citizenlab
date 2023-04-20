import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrorsJSON } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IBlockUser } from './types';
import blockedUsersCountKeys from './keys';
import { IUser } from 'services/users';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';

const blockUser = async ({ userId, reason }: IBlockUser) => {
  return fetcher<IUser>({
    path: `/users/${userId}/block`,
    action: 'patch',
    body: { block_reason: reason },
  });
};

const useBlockUser = () => {
  const queryClient = useQueryClient();
  return useMutation<IUser, Error | CLErrorsJSON, IBlockUser>({
    mutationFn: blockUser,
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

export default useBlockUser;
