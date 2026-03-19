import { useMutation, useQueryClient } from '@tanstack/react-query';

import adminPublicationsKeys from 'api/admin_publications/keys';
import invalidateSeatsCache from 'api/seats/invalidateSeatsCache';
import usersKeys from 'api/users/keys';
import userCountKeys from 'api/users_count/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import spaceModeratorsKeys from './keys';
import { Params } from './types';

const deleteSpaceModerator = ({ spaceId, userId }: Params) => {
  return fetcher({
    path: `/spaces/${spaceId}/moderators/${userId}`,
    action: 'delete',
  });
};

const useDeleteSpaceModerator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSpaceModerator,
    onSuccess: async (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: spaceModeratorsKeys.list({
          spaceId: variables.spaceId,
        }),
      });

      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: adminPublicationsKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: userCountKeys.items(),
      });

      invalidateSeatsCache();
    },
  });
};

export default useDeleteSpaceModerator;
