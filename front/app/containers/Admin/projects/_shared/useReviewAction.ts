import useProjectReview from 'api/project_reviews/useProjectReview';
import { IProjectData } from 'api/projects/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { usePermission } from 'utils/permissions';

type ReviewAction = 'approve' | 'request' | null;

const useReviewAction = (project: IProjectData) => {
  const isProjectReviewEnabled = useFeatureFlag({ name: 'project_review' });
  const canReview = usePermission({ item: project, action: 'review' });
  const { data: projectReview, isLoading } = useProjectReview(project.id);

  const state = projectReview?.data.attributes.state;
  const pending = state === 'pending';
  const isPublished = project.attributes.publication_status === 'published';

  const getAction = (): ReviewAction => {
    if (!isProjectReviewEnabled) return null;
    if (canReview) return pending ? 'approve' : null;
    if (state === 'approved' || isPublished) return null;
    return 'request';
  };

  return { action: getAction(), pending, isLoading };
};

export default useReviewAction;
