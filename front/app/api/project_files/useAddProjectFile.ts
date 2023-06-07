import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import projectFilesKeys from './keys';
import { IProjectFile, AddProjectFileObject } from './types';

const addProjectFile = async ({
  projectId,
  ...requestBody
}: AddProjectFileObject) =>
  fetcher<IProjectFile>({
    path: `/projects/${projectId}/files`,
    action: 'post',
    body: requestBody,
  });

const useAddProjectFile = () => {
  const queryClient = useQueryClient();
  return useMutation<IProjectFile, CLErrors, AddProjectFileObject>({
    mutationFn: addProjectFile,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectFilesKeys.list({
          projectId: variables.projectId,
        }),
      });
    },
  });
};

export default useAddProjectFile;
