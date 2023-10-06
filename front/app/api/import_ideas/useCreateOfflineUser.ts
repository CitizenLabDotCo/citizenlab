import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';

// keys
import usersKeys from 'api/users/keys';
import groupsKeys from 'api/groups/keys';

// typings
import { IUser } from 'api/users/types';
import { CLErrorsWrapper } from 'typings';
import { CreateOfflineIdeasParams } from './types';

export const createOfflineUser = async ({
  projectId,
  ...requestBody
}: CreateOfflineIdeasParams) =>
  fetcher<IUser>({
    path: `/projects/${projectId}/create_user`,
    action: 'post',
    body: { user: { ...requestBody } },
  });

const useCreateOfflineUser = () => {
  const queryClient = useQueryClient();

  return useMutation<IUser, CLErrorsWrapper, CreateOfflineIdeasParams>({
    mutationFn: createOfflineUser,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: groupsKeys.all() });
    },
  });
};

export default useCreateOfflineUser;
