import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import projectReviewKeys from './keys';
import { ProjectReview } from './types';

const approveProjectReview = async (projectId: string) =>
  fetcher<ProjectReview>({
    path: `/projects/${projectId}/review`,
    action: 'patch',
    body: { project_review: { state: 'approved' } },
  });

const useApproveProjectReview = () => {
  const queryClient = useQueryClient();

  return useMutation<ProjectReview, CLErrors, string>({
    mutationFn: approveProjectReview,
    onSuccess: (_data, projectId) => {
      queryClient.invalidateQueries({
        queryKey: projectReviewKeys.item({
          projectId,
        }),
      });
    },
  });
};

export default useApproveProjectReview;
