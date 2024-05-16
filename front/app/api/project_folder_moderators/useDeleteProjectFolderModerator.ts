import { useMutation, useQueryClient } from '@tanstack/react-query';

import adminPublicationsKeys from 'api/admin_publications/keys';
import invalidateSeatsCache from 'api/seats/invalidateSeatsCache';
import usersKeys from 'api/users/keys';
import userCountKeys from 'api/users_count/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import projectFolderModeratorsKeys from './keys';

const deleteModerator = ({
  projectFolderId,
  id,
}: {
  projectFolderId: string;
  id: string;
}) =>
  fetcher({
    path: `/project_folders/${projectFolderId}/moderators/${id}`,
    action: 'delete',
  });

const useDeleteProjectFolderModerator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteModerator,
    onSuccess: async (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectFolderModeratorsKeys.list({
          projectFolderId: variables.projectFolderId,
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

export default useDeleteProjectFolderModerator;
