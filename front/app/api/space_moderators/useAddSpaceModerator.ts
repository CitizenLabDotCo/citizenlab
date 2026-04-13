import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import adminPublicationsKeys from 'api/admin_publications/keys';
import invalidateSeatsCache from 'api/seats/invalidateSeatsCache';
import spacesKeys from 'api/spaces/keys';
import usersKeys from 'api/users/keys';
import { IUser } from 'api/users/types';
import userCountKeys from 'api/users_count/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import spaceModeratorsKeys from './keys';

interface Params {
  user_id?: string;
  user_email?: string;
  spaceId: string;
}

const addSpaceModerator = ({ spaceId, user_email, user_id }: Params) => {
  return fetcher<IUser>({
    path: `/spaces/${spaceId}/moderators`,
    action: 'post',
    body: {
      moderator: {
        user_id,
        user_email,
      },
    },
  });
};

const useAddSpaceModerator = () => {
  const queryClient = useQueryClient();
  return useMutation<IUser, CLErrors, Params>({
    mutationFn: addSpaceModerator,
    onSuccess: async (_data) => {
      queryClient.invalidateQueries({
        queryKey: spaceModeratorsKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: spacesKeys.all(),
      });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: userCountKeys.items(),
      });
      queryClient.invalidateQueries({
        queryKey: adminPublicationsKeys.lists(),
      });
      invalidateSeatsCache();
    },
  });
};

export default useAddSpaceModerator;
