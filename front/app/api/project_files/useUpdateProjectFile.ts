import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

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
  return useMutation<IProjectFile, CLErrors, UpdateProjectFileObject>({
    mutationFn: updateProjectFile,
  });
};

export default useUpdateProjectFile;
