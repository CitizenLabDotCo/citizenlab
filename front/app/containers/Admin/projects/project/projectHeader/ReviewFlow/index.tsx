import React, { useState } from 'react';

import { Button, Tooltip, Box } from '@citizenlab/cl2-component-library';

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
  const { mutate: updateProject, isLoading } = useUpdateProject();
  const canPublish = usePermission({
    item: project,
    action: 'publish',
    context: false,
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
            processing={isLoading}
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
          processing={isLoading}
          size="s"
          padding="4px 8px"
          iconSize="20px"
          disabled={!canPublish && !isProjectReviewEnabled}
        >
          {formatMessage(messages.requestApproval)}
        </Button>
      )}
      <ReviewRequest
        isOpen={isProjectReviewDropdownOpened}
        onClose={() => setIsProjectReviewDropdownOpened(false)}
        sendRequest={() => new Promise((resolve) => setTimeout(resolve, 1000))}
      />
    </Box>
  );
};

export default ReviewFlow;
