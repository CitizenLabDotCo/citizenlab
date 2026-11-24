import useProjectReview from 'api/project_reviews/useProjectReview';
import { IProjectData } from 'api/projects/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { usePermission } from 'utils/permissions';

const usePublishAccess = (project: IProjectData) => {
  const isProjectReviewEnabled = useFeatureFlag({ name: 'project_review' });
  const { data: projectReview } = useProjectReview(project.id);
  const canPublish = usePermission({
    item: project,
    action: 'publish',
    context: projectReview?.data.attributes.state === 'approved',
  });

  const isPublished = project.attributes.publication_status === 'published';

  return {
    // A published project keeps its publish control so it can be unpublished,
    // even by someone who can't publish.
    showPublish: !isProjectReviewEnabled || isPublished || canPublish,
    publishDisabled: !canPublish && !project.attributes.first_published_at,
  };
};

export default usePublishAccess;
