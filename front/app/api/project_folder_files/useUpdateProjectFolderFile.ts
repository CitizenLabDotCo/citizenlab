import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import projectFolderFilesKeys from './keys';
import { IProjectFolderFile, UpdateProjectFolderFileObject } from './types';

const updateProjectFolderFile = async ({
  projectFolderId,
  fileId,
  ...requestBody
}: UpdateProjectFolderFileObject) =>
  fetcher<IProjectFolderFile>({
    path: `/project_folders/${projectFolderId}/files/${fileId}`,
    action: 'patch',
    body: requestBody,
  });

const useUpdateProjectFolderFile = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IProjectFolderFile,
    CLErrors,
    UpdateProjectFolderFileObject
  >({
    mutationFn: updateProjectFolderFile,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectFolderFilesKeys.list({
          projectFolderId: variables.projectFolderId,
        }),
      });
    },
  });
};

export default useUpdateProjectFolderFile;
