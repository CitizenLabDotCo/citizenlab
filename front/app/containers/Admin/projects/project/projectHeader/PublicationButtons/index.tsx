import React, { useState } from 'react';

import { Button, Box, Tooltip } from '@citizenlab/cl2-component-library';

import useProjectReview from 'api/project_reviews/useProjectReview';
import { IProjectData, PublicationStatus } from 'api/projects/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import ChangeStatusModal from './ChangeStatusModal';
import messages from './messages';
import ReviewFlow from './ReviewFlow';
import ScheduleLaunchModal from './ScheduleLaunchModal';
import tracks from './tracks';

const getPublicationButton = ({
  publicationStatus,
  hasSchedule,
}: {
  publicationStatus: PublicationStatus;
  hasSchedule: boolean;
}) => {
  let text = messages.publish;
  let icon: 'send' | 'clock' | 'check-circle' | 'inbox' = 'send';
  if (publicationStatus === 'draft') {
    if (hasSchedule) {
      text = messages.scheduled;
      icon = 'clock';
    }
  } else if (publicationStatus === 'published') {
    text = messages.published;
    icon = 'check-circle';
  } else {
    text = messages.archived;
    icon = 'inbox';
  }
  return { text, icon };
};

const PublicationButtons = ({ project }: { project: IProjectData }) => {
  const isProjectReviewEnabled = useFeatureFlag({ name: 'project_review' });
  const { formatMessage } = useIntl();

  const { data: projectReview } = useProjectReview(project.id);

  const canModerate = usePermission({ item: project, action: 'moderate' });
  const canPublish = usePermission({
    item: project,
    action: 'publish',
    context: projectReview?.data.attributes.state === 'approved',
  });

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [changeStatusModalOpen, setChangeStatusModalOpen] = useState(false);

  if (!canModerate) return null;

  const { publication_status, scheduled_at } = project.attributes;
  const isDraft = publication_status === 'draft';

  const publicationButton = getPublicationButton({
    publicationStatus: publication_status,
    hasSchedule: !!scheduled_at,
  });

  const handleEntryClick = () => {
    if (isDraft) {
      trackEventByName(tracks.scheduleLaunchModalOpened);
      setScheduleModalOpen(true);
    } else {
      trackEventByName(tracks.changeStatusModalOpened);
      setChangeStatusModalOpen(true);
    }
  };

  const showPublishButton = !isProjectReviewEnabled || canPublish;
  const publishButtonDisabled =
    !canPublish && !project.attributes.first_published_at;
  return (
    <Box display="flex" gap="8px">
      {showPublishButton && (
        <Tooltip
          content={formatMessage(
            messages.onlyAdminsAndFolderManagersCanPublish,
            { inFolder: !!project.attributes.folder_id }
          )}
          placement="bottom"
          disabled={!publishButtonDisabled}
        >
          <Button
            buttonStyle="admin-dark"
            icon={publicationButton.icon}
            onClick={handleEntryClick}
            size="s"
            padding="4px 8px"
            iconSize="20px"
            id="e2e-publish"
            disabled={publishButtonDisabled}
          >
            {formatMessage(publicationButton.text)}
          </Button>
        </Tooltip>
      )}

      {isProjectReviewEnabled && <ReviewFlow project={project} />}

      <ScheduleLaunchModal
        opened={scheduleModalOpen}
        project={project}
        onClose={() => setScheduleModalOpen(false)}
      />

      <ChangeStatusModal
        key={project.attributes.publication_status}
        opened={changeStatusModalOpen}
        project={project}
        onClose={() => setChangeStatusModalOpen(false)}
      />
    </Box>
  );
};

export default PublicationButtons;
