import React, { useState } from 'react';

import { Button, Tooltip, Box } from '@citizenlab/cl2-component-library';

import useProjectReview from 'api/project_reviews/useProjectReview';
import { IProjectData } from 'api/projects/types';
import useUpdateProject from 'api/projects/useUpdateProject';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { useIntl } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import messages from './messages';
import ReviewFlow from './ReviewFlow';
import ScheduleLaunchModal from './ScheduleLaunchModal';

const PublicationButtons = ({ project }: { project: IProjectData }) => {
  const isProjectReviewEnabled = useFeatureFlag({ name: 'project_review' });
  const isProjectSchedulingEnabled = useFeatureFlag({
    name: 'project_scheduling',
  });
  const { formatMessage } = useIntl();

  const { data: projectReview } = useProjectReview(project.id);

  const { mutate: updateProject, isLoading: isUpdatingProjectLoading } =
    useUpdateProject();

  const canPublish = usePermission({
    item: project,
    action: 'publish',
    context: projectReview?.data.attributes.state === 'approved',
  });

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const publishProject = () => {
    updateProject({
      projectId: project.id,
      admin_publication_attributes: {
        publication_status: 'published',
      },
    });
  };
  const handlePublishClick = () => {
    if (isProjectSchedulingEnabled) {
      setScheduleModalOpen(true);
    } else {
      publishProject();
    }
  };

  // Only display the component if the project has not been published yet
  if (project.attributes.first_published_at) {
    return null;
  }

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
            onClick={handlePublishClick}
            processing={isUpdatingProjectLoading}
            size="s"
            padding="4px 8px"
            iconSize="20px"
            disabled={!canPublish && !isProjectSchedulingEnabled}
            id="e2e-publish"
          >
            {formatMessage(messages.publish)}
          </Button>
        </Tooltip>
      )}

      {isProjectReviewEnabled && <ReviewFlow project={project} />}

      {isProjectSchedulingEnabled && (
        <ScheduleLaunchModal
          opened={scheduleModalOpen}
          project={project}
          onClose={() => setScheduleModalOpen(false)}
          onPublishNow={() => {
            publishProject();
            setScheduleModalOpen(false);
          }}
        />
      )}
    </Box>
  );
};

export default PublicationButtons;
