import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrorsWrapper } from 'typings';

import groupsKeys from 'api/groups/keys';
import usersKeys from 'api/users/keys';
import { IUser } from 'api/users/types';

import fetcher from 'utils/cl-react-query/fetcher';

import { CreateOfflineIdeasParams } from './types';

export const createOfflineUser = async ({
  phaseId,
  ...requestBody
}: CreateOfflineIdeasParams) =>
  fetcher<IUser>({
    path: `/phases/${phaseId}/importer/create_user`,
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
