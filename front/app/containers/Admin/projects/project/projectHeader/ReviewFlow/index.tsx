import React, { useState } from 'react';

import {
  Button,
  Tooltip,
  Box,
  colors,
} from '@citizenlab/cl2-component-library';

import useApproveProjectReview from 'api/project_reviews/useApproveProject';
import useProjectReview from 'api/project_reviews/useProjectReview';
import { IProjectData } from 'api/projects/types';
import useUpdateProject from 'api/projects/useUpdateProject';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { useIntl } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import messages from './messages';
import ReviewRequest from './ReviewRequest';

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
    context: projectReview?.data.attributes.approved,
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

  if (project.attributes.publication_status !== 'draft') {
    return null;
  }

  const approvalPending =
    projectReview && projectReview.data.attributes.approved === false;
  const showPublishButton =
    (canPublish || !isProjectReviewEnabled) && !approvalPending;
  const showReviewRequestButton = isProjectReviewEnabled && !canReview;
  const showProjectApprovalButton = approvalPending && canReview;

  return (
    <Box position="relative">
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
          >
            {formatMessage(messages.publish)}
          </Button>
        </Tooltip>
      )}

      {showReviewRequestButton && (
        <Button
          buttonStyle="admin-dark"
          icon="send"
          onClick={() => setIsProjectReviewDropdownOpened(true)}
          processing={isProjectReviewLoading}
          size="s"
          padding="4px 8px"
          iconSize="20px"
          disabled={approvalPending}
        >
          {approvalPending
            ? formatMessage(messages.pendingApproval)
            : formatMessage(messages.requestApproval)}
        </Button>
      )}
      <ReviewRequest
        isOpen={isProjectReviewDropdownOpened}
        onClose={() => setIsProjectReviewDropdownOpened(false)}
        projectId={project.id}
      />

      {showProjectApprovalButton && (
        <Button
          bgColor={colors.success}
          icon="check"
          onClick={() => approveProjectReview(project.id)}
          processing={isApprovingProjectReviewLoading}
          size="s"
          padding="4px 8px"
          iconSize="20px"
        >
          {formatMessage(messages.approve)}
        </Button>
      )}
    </Box>
  );
};

export default ReviewFlow;
