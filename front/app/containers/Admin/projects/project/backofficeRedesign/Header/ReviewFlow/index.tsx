import React from 'react';

import useProjectReview from 'api/project_reviews/useProjectReview';
import { IProjectData } from 'api/projects/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { usePermission } from 'utils/permissions';

import ApproveButton from './ApproveButton';
import RequestApprovalDropdown from './RequestApprovalDropdown';

interface Props {
  project: IProjectData;
  opened: boolean;
  onOpenChange: (opened: boolean) => void;
}

const ReviewFlow = ({ project, opened, onOpenChange }: Props) => {
  const isProjectReviewEnabled = useFeatureFlag({ name: 'project_review' });
  const canReview = usePermission({ item: project, action: 'review' });
  const { data: projectReview, isLoading } = useProjectReview(project.id);

  if (!isProjectReviewEnabled) return null;

  const state = projectReview?.data.attributes.state;
  const isPublished = project.attributes.publication_status === 'published';

  if (canReview) {
    return state === 'pending' ? (
      <ApproveButton projectId={project.id} />
    ) : null;
  }

  if (state === 'approved' || isPublished) return null;

  return (
    <RequestApprovalDropdown
      projectId={project.id}
      inFolder={!!project.attributes.folder_id}
      pending={state === 'pending'}
      processing={isLoading}
      opened={opened}
      onOpenChange={onOpenChange}
    />
  );
};

export default ReviewFlow;
