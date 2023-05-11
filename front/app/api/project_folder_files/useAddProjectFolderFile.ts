import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import projectFolderFilesKeys from './keys';
import { IProjectFolderFile, AddProjectFolderObject } from './types';

const addProjectFolderFile = async ({
  projectFolderId,
  ...requestBody
}: AddProjectFolderObject) =>
  fetcher<IProjectFolderFile>({
    path: `/project_folders/${projectFolderId}/files`,
    action: 'post',
    body: { file: { ...requestBody } },
  });

const useAddProjectFolderFile = () => {
  const queryClient = useQueryClient();
  return useMutation<IProjectFolderFile, CLErrors, AddProjectFolderObject>({
    mutationFn: addProjectFolderFile,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectFolderFilesKeys.list({
          projectFolderId: variables.projectFolderId,
        }),
      });
    },
  });
};

export default useAddProjectFolderFile;
