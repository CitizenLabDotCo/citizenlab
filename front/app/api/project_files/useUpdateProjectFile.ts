import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import projectFilesKeys from './keys';
import { IProjectFile, UpdateProjectFileObject } from './types';

const updateProjectFile = async ({
  projectId,
  fileId,
  ...requestBody
}: UpdateProjectFileObject) =>
  fetcher<IProjectFile>({
    path: `/projects/${projectId}/files/${fileId}`,
    action: 'patch',
    body: requestBody,
  });

const useUpdateProjectFile = () => {
  const queryClient = useQueryClient();
  return useMutation<IProjectFile, CLErrors, UpdateProjectFileObject>({
    mutationFn: updateProjectFile,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectFilesKeys.list({
          projectId: variables.projectId,
        }),
      });
    },
  });
};

export default useUpdateProjectFile;
