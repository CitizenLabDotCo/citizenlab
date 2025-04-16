import React from 'react';

import { Button, Tooltip, Box } from '@citizenlab/cl2-component-library';

import useApproveProjectReview from 'api/project_reviews/useApproveProject';
import useProjectReview from 'api/project_reviews/useProjectReview';
import { IProjectData } from 'api/projects/types';
import useUpdateProject from 'api/projects/useUpdateProject';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { useIntl } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import messages from './messages';
import ReviewRequestButton from './ReviewRequestButton';

const ReviewFlow = ({ project }: { project: IProjectData }) => {
  const isProjectReviewEnabled = useFeatureFlag({ name: 'project_review' });

  const { formatMessage } = useIntl();

  const { data: projectReview, isLoading: isProjectReviewLoading } =
    useProjectReview(project.id);

  const { mutate: updateProject, isLoading: isUpdatingProjectLoading } =
    useUpdateProject();

  const {
    mutate: approveProjectReview,
    isLoading: isApprovingProjectReviewLoading,
  } = useApproveProjectReview();

  const canPublish = usePermission({
    item: project,
    action: 'publish',
    context: projectReview?.data.attributes.state === 'approved',
  });

  const canReview = usePermission({
    item: project,
    action: 'review',
  });

  const publishProject = () => {
    updateProject({
      projectId: project.id,
      admin_publication_attributes: {
        publication_status: 'published',
      },
    });
  };

  // Only display the component if the project has not been published yet
  if (project.attributes.first_published_at) {
    return null;
  }

  const approvalPending = projectReview?.data.attributes.state === 'pending';
  const approvalGranted = projectReview?.data.attributes.state === 'approved';

  const showProjectApprovalButton =
    isProjectReviewEnabled && approvalPending && canReview;
  const showReviewRequestButton =
    isProjectReviewEnabled && !canReview && !approvalGranted;
  const showPublishButton = !isProjectReviewEnabled || canPublish;

  return (
    <Box display="flex" gap="8px">
      {showPublishButton && (
        <Tooltip
          content={formatMessage(
            messages.onlyAdminsAndFolderManagersCanPublish,
            { inFolder: !!project.attributes.folder_id }
          )}
          placement="bottom"
          disabled={canPublish}
        >
          <Button
            buttonStyle="admin-dark"
            icon="send"
            onClick={publishProject}
            processing={isUpdatingProjectLoading}
            size="s"
            padding="4px 8px"
            iconSize="20px"
            disabled={!canPublish}
            id="e2e-publish"
          >
            {formatMessage(messages.publish)}
          </Button>
        </Tooltip>
      )}

      {showReviewRequestButton && (
        <Box position="relative">
          <ReviewRequestButton
            projectId={project.id}
            inFolder={!!project.attributes.folder_id}
            approvalPending={approvalPending}
            processing={isProjectReviewLoading}
          />
        </Box>
      )}

      {showProjectApprovalButton && (
        <Tooltip
          content={formatMessage(messages.approveTooltip)}
          placement="bottom"
        >
          <Button
            buttonStyle="admin-dark"
            icon="unlock"
            onClick={() => approveProjectReview(project.id)}
            processing={isApprovingProjectReviewLoading}
            size="s"
            padding="4px 8px"
            iconSize="20px"
            id="e2e-approve-project"
          >
            {formatMessage(messages.approve)}
          </Button>
        </Tooltip>
      )}
    </Box>
  );
};

export default ReviewFlow;
