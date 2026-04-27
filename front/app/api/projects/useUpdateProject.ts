import { useMutation } from '@tanstack/react-query';
import { CLErrorsWrapper } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { IProject, IUpdatedProjectProperties } from './types';
import { invalidateOnCRUD } from './utils';

export const updateProject = async ({
  projectId,
  ...requestBody
}: IUpdatedProjectProperties) =>
  fetcher<IProject>({
    path: `/projects/${projectId}`,
    action: 'patch',
    body: { project: { ...requestBody } },
  });

const useUpdateProject = () => {
  return useMutation<IProject, CLErrorsWrapper, IUpdatedProjectProperties>({
    mutationFn: updateProject,
    onSuccess: async (_data) => {
      invalidateOnCRUD();
    },
  });
};

export default useUpdateProject;
