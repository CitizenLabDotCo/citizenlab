import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import projectReviewKeys from './keys';
import { ProjectReview } from './types';

const requestProjectReview = async (projectId: string) =>
  fetcher<ProjectReview>({
    path: `/projects/${projectId}/review`,
    action: 'post',
    body: {},
  });

const useRequestProjectReview = () => {
  const queryClient = useQueryClient();

  return useMutation<ProjectReview, CLErrors, string>({
    mutationFn: requestProjectReview,
    onSuccess: (_data, projectId) => {
      queryClient.invalidateQueries({
        queryKey: projectReviewKeys.item({
          projectId,
        }),
      });
    },
  });
};

export default useRequestProjectReview;
