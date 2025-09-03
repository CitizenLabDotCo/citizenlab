import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import adminPublicationsKeys from 'api/admin_publications/keys';
import adminPublicationsStatusCountsKeys from 'api/admin_publications_status_counts/keys';
import projectFoldersKeys from 'api/project_folders/keys';
import projectFoldersMiniKeys from 'api/project_folders_mini/keys';
import projectsKeys from 'api/projects/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import { INewProjectFolderDiff, IProjectFolder } from './types';

export const addProjectFolder = async ({
  ...requestBody
}: Partial<INewProjectFolderDiff>) =>
  fetcher<IProjectFolder>({
    path: `/project_folders`,
    action: 'post',
    body: { project_folder: { ...requestBody } },
  });

const useAddProjectFolder = () => {
  const queryClient = useQueryClient();
  return useMutation<IProjectFolder, CLErrors, INewProjectFolderDiff>({
    mutationFn: addProjectFolder,
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: projectFoldersKeys.lists(),
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

export default useAddProjectFolder;
