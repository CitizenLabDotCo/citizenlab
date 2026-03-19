import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import adminPublicationsKeys from 'api/admin_publications/keys';
import invalidateSeatsCache from 'api/seats/invalidateSeatsCache';
import usersKeys from 'api/users/keys';
import { IUser } from 'api/users/types';
import userCountKeys from 'api/users_count/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import spaceModeratorsKeys from './keys';

interface Params {
  spaceId: string;
  userId: string;
}

const addSpaceModerator = ({ spaceId, userId }: Params) => {
  return fetcher<IUser>({
    path: `/spaces/${spaceId}/moderators`,
    action: 'post',
    body: {
      space_moderator: {
        user_id: userId,
      },
    },
  });
};

const useAddSpaceModerator = () => {
  const queryClient = useQueryClient();
  return useMutation<IUser, CLErrors, Params>({
    mutationFn: addSpaceModerator,
    onSuccess: async (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: spaceModeratorsKeys.list({
          spaceId: variables.spaceId,
        }),
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
