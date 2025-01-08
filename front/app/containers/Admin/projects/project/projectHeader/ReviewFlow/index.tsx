import React, { useState } from 'react';

import { Button, Tooltip, Box } from '@citizenlab/cl2-component-library';

import useApproveProjectReview from 'api/project_reviews/useApproveProject';
import useProjectReview from 'api/project_reviews/useProjectReview';
import { IProjectData } from 'api/projects/types';
import useUpdateProject from 'api/projects/useUpdateProject';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import messages from './messages';
import ReviewRequest from './ReviewRequest';
import tracks from './tracks';

const ReviewFlow = ({ project }: { project: IProjectData }) => {
  const [isProjectReviewDropdownOpened, setIsProjectReviewDropdownOpened] =
    useState(false);
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

  const approvalPending =
    projectReview && projectReview.data.attributes.state === 'pending';
  const approvalGranted =
    projectReview && projectReview.data.attributes.state === 'approved';

  const showPublishButton =
    (canPublish || !isProjectReviewEnabled) && !approvalPending;

  const showReviewRequestButton =
    isProjectReviewEnabled && !canReview && !approvalGranted;
  const showProjectApprovalButton = approvalPending && canReview;

  return (
    <Box>
      {showPublishButton && (
        <Tooltip
          content={formatMessage(
            messages.onlyAdminsAndFolderManagersCanPublish
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
          <Tooltip
            content={formatMessage(messages.pendingApprovalTooltip)}
            placement="bottom"
            disabled={!approvalPending}
          >
            <Button
              buttonStyle="admin-dark"
              icon="send"
              onClick={() => setIsProjectReviewDropdownOpened(true)}
              processing={isProjectReviewLoading}
              size="s"
              padding="4px 8px"
              iconSize="20px"
              disabled={approvalPending}
              data-cy={
                approvalPending
                  ? 'e2e-request-approval-pending'
                  : 'e2e-request-approval'
              }
            >
              {approvalPending
                ? formatMessage(messages.pendingApproval)
                : formatMessage(messages.requestApproval)}
            </Button>
          </Tooltip>
          <ReviewRequest
            isOpen={isProjectReviewDropdownOpened}
            onClose={() => {
              setIsProjectReviewDropdownOpened(false);
              trackEventByName(tracks.projectReviewDropdownOpened);
            }}
            projectId={project.id}
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
