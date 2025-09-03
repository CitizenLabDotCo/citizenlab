import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

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
  return useMutation<IProjectFile, CLErrors, AddProjectFileObject>({
    mutationFn: addProjectFile,
  });
};

export default useAddProjectFile;
