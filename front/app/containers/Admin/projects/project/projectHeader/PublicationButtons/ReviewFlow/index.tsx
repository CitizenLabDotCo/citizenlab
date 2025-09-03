import React from 'react';

import { Button, Tooltip, Box } from '@citizenlab/cl2-component-library';

import useApproveProjectReview from 'api/project_reviews/useApproveProject';
import useProjectReview from 'api/project_reviews/useProjectReview';
import { IProjectData } from 'api/projects/types';

import { useIntl } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import messages from '../messages';

import ReviewRequestButton from './ReviewRequestButton';

interface Props {
  project: IProjectData;
}

const ReviewFlow = ({ project }: Props) => {
  const canReview = usePermission({
    item: project,
    action: 'review',
  });
  const { data: projectReview, isLoading: isProjectReviewLoading } =
    useProjectReview(project.id);
  const {
    mutate: approveProjectReview,
    isLoading: isApprovingProjectReviewLoading,
  } = useApproveProjectReview();
  const { formatMessage } = useIntl();

  const approvalPending = projectReview?.data.attributes.state === 'pending';
  const approvalGranted = projectReview?.data.attributes.state === 'approved';

  const showProjectApprovalButton = approvalPending && canReview;
  const showReviewRequestButton = !canReview && !approvalGranted;

  return (
    <>
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
    </>
  );
};

export default ReviewFlow;
