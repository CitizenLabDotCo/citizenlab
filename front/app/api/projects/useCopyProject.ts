import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import adminSearchKeys from 'api/admin_search/keys';

import fetcher from 'utils/cl-react-query/fetcher';
import { queryClient } from 'utils/cl-react-query/queryClient';

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
      queryClient.invalidateQueries({ queryKey: adminSearchKeys.all() });
    },
  });
};

export default useCopyProject;
