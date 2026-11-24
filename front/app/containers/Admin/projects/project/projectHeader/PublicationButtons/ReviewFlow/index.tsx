import React from 'react';

import { Button, Tooltip, Box } from '@citizenlab/cl2-component-library';

import useApproveProjectReview from 'api/project_reviews/useApproveProject';
import { IProjectData } from 'api/projects/types';

import useReviewAction from 'containers/Admin/projects/_shared/useReviewAction';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import ReviewRequestButton from './ReviewRequestButton';

interface Props {
  project: IProjectData;
}

const ReviewFlow = ({ project }: Props) => {
  const { action, pending, isLoading } = useReviewAction(project);
  const {
    mutate: approveProjectReview,
    isPending: isApprovingProjectReviewLoading,
  } = useApproveProjectReview();
  const { formatMessage } = useIntl();

  return (
    <>
      {action === 'request' && (
        <Box position="relative">
          <ReviewRequestButton
            projectId={project.id}
            inFolder={!!project.attributes.folder_id}
            approvalPending={pending}
            processing={isLoading}
          />
        </Box>
      )}
      {action === 'approve' && (
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
