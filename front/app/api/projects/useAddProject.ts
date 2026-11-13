import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import adminSearchKeys from 'api/admin_search/keys';

import fetcher from 'utils/cl-react-query/fetcher';
import { queryClient } from 'utils/cl-react-query/queryClient';

import { IProject, IUpdatedProjectProperties } from './types';
import { invalidateOnCRUD } from './utils';

const addProject = async (project: IUpdatedProjectProperties) =>
  fetcher<IProject>({
    path: `/projects`,
    action: 'post',
    body: { project },
  });

const useAddProject = () => {
  return useMutation<IProject, CLErrors, IUpdatedProjectProperties>({
    mutationFn: addProject,
    onSuccess: () => {
      invalidateOnCRUD();
      queryClient.invalidateQueries({ queryKey: adminSearchKeys.all() });
    },
  });
};

export default useAddProject;
