import { useMutation, useQueryClient } from '@tanstack/react-query';
import projectsKeys from './keys';
import { IProject } from './types';
import fetcher from 'utils/cl-react-query/fetcher';
import { CLErrors } from 'typings';
import projectFoldersKeys from 'api/project_folders/keys';
import adminPublicationsKeys from 'api/admin_publications/keys';

interface Params {
  projectId: string;
  newProjectFolderId: string | null;
  oldProjectFolderId?: string;
}

const updateProjectFolderMembership = async ({
  projectId,
  newProjectFolderId,
}: Params) =>
  fetcher<IProject>({
    path: `/projects/${projectId}`,
    action: 'patch',
    body: { project: { folder_id: newProjectFolderId } },
  });

const useUpdateProjectFolderMembership = () => {
  const queryClient = useQueryClient();
  return useMutation<IProject, CLErrors, Params>({
    mutationFn: updateProjectFolderMembership,
    onSuccess: async (_data, { newProjectFolderId, oldProjectFolderId }) => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.lists() });

      if (newProjectFolderId) {
        queryClient.invalidateQueries({
          queryKey: projectFoldersKeys.item({ id: newProjectFolderId }),
        });
      }

      if (oldProjectFolderId) {
        queryClient.invalidateQueries({
          queryKey: projectFoldersKeys.item({ id: oldProjectFolderId }),
        });
      }
      queryClient.invalidateQueries({
        queryKey: adminPublicationsKeys.lists(),
      });
    },
  });
};

export default useUpdateProjectFolderMembership;
