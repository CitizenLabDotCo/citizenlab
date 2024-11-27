import React, { useState } from 'react';

import { Button, Tooltip, Box } from '@citizenlab/cl2-component-library';

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
  const { formatMessage } = useIntl();
  const isProjectReviewEnabled = useFeatureFlag({ name: 'project_review' });
  const { data: projectReview, isLoading: isProjectReviewLoading } =
    useProjectReview(project.id);
  const { mutate: updateProject, isLoading: isUpdatingProjectLoading } =
    useUpdateProject();
  const canPublish = usePermission({
    item: project,
    action: 'publish',
    context: projectReview?.data.attributes.approved,
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
  return (
    <Box position="relative">
      {/* Publish button */}
      {(canPublish || !isProjectReviewEnabled) && (
        <Tooltip
          content={formatMessage(
            messages.onlyAdminsAndFolderManagersCanPublish
          )}
          placement="bottom"
          disabled={canPublish && !isProjectReviewEnabled}
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
      {/* Review request button */}
      {isProjectReviewEnabled && (
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
    </Box>
  );
};

export default ReviewFlow;
