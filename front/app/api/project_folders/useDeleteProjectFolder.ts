import { useMutation, useQueryClient } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import adminPublicationsKeys from 'api/admin_publications/keys';
import adminPublicationsStatusCountsKeys from 'api/admin_publications_status_counts/keys';
import projectsKeys from 'api/projects/keys';

import projectFolderKeys from './keys';

const deleteProjectFolder = ({
  projectFolderId,
}: {
  projectFolderId: string;
}) =>
  fetcher({
    path: `/project_folders/${projectFolderId}`,
    action: 'delete',
  });

const useDeleteProjectFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProjectFolder,
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: projectFolderKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: projectsKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: adminPublicationsKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: adminPublicationsStatusCountsKeys.items(),
      });
    },
  });
};

export default useDeleteProjectFolder;
