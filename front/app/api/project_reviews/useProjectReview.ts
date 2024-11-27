import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import projectReviewsKeys from './keys';
import { ProjectReview, ProjectReviewsKeys } from './types';

const fetchProjectReview = (projectId: string) =>
  fetcher<ProjectReview>({
    path: `/projects/${projectId}/review`,
    action: 'get',
  });

const useProjectReview = (projectId: string) => {
  return useQuery<ProjectReview, CLErrors, ProjectReview, ProjectReviewsKeys>({
    queryKey: projectReviewsKeys.item({ projectId }),
    queryFn: () => fetchProjectReview(projectId),
  });
};

export default useProjectReview;
