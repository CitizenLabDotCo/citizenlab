import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrorsWrapper } from 'typings';

import projectReviewsKeys from 'api/project_reviews/keys';

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
  const queryClient = useQueryClient();

  return useMutation<IProject, CLErrorsWrapper, IUpdatedProjectProperties>({
    mutationFn: updateProject,
    onSuccess: async (project) => {
      invalidateOnCRUD();
      // A publication status change can delete or approve the project's review
      // server-side, so the cached review no longer reflects the project.
      queryClient.invalidateQueries({
        queryKey: projectReviewsKeys.item({ projectId: project.data.id }),
      });
    },
  });
};

export default useUpdateProject;
