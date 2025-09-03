import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import adminPublicationsKeys from 'api/admin_publications/keys';
import adminPublicationsStatusCountsKeys from 'api/admin_publications_status_counts/keys';
import projectFoldersKeys from 'api/project_folders/keys';
import projectFoldersMiniKeys from 'api/project_folders_mini/keys';
import projectsKeys from 'api/projects/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import { IProjectFolder, IUpdatedProjectFolder } from './types';

export const updateProjectFolder = async ({
  projectFolderId,
  ...requestBody
}: IUpdatedProjectFolder) =>
  fetcher<IProjectFolder>({
    path: `/project_folders/${projectFolderId}`,
    action: 'patch',
    body: { project_folder: { ...requestBody } },
  });

const useUpdateProjectFolder = () => {
  const queryClient = useQueryClient();
  return useMutation<IProjectFolder, CLErrors, IUpdatedProjectFolder>({
    mutationFn: updateProjectFolder,
    onSuccess: async (_data) => {
      queryClient.invalidateQueries({
        queryKey: projectFoldersKeys.item({ id: _data.data.id }),
      });
      queryClient.invalidateQueries({
        queryKey: projectFoldersMiniKeys.lists(),
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

export default useUpdateProjectFolder;
