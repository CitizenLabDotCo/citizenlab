import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { IProject } from './types';
import { invalidateOnCRUD } from './utils';

const copyProject = async (projectId: string) =>
  fetcher<IProject>({
    path: `/projects/${projectId}/copy`,
    action: 'post',
    body: {},
  });

const useCopyProject = () => {
  return useMutation<IProject, CLErrors, string>({
    mutationFn: copyProject,
    onSuccess: () => {
      invalidateOnCRUD();
    },
  });
};

export default useCopyProject;
