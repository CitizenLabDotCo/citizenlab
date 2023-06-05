import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import projectFoldersKeys from 'api/project_folders/keys';
import { INewProjectFolderDiff, IProjectFolder } from './types';
import projectsKeys from 'api/projects/keys';
import adminPublicationsKeys from 'api/admin_publications/keys';

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
        queryKey: projectsKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: adminPublicationsKeys.lists(),
      });
    },
  });
};

export default useAddProjectFolder;
