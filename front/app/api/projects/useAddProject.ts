import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

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
    },
  });
};

export default useAddProject;
