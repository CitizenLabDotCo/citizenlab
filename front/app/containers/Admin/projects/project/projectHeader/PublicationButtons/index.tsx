import React, { useState } from 'react';

import { Button, Box } from '@citizenlab/cl2-component-library';

import useProjectReview from 'api/project_reviews/useProjectReview';
import { IProjectData, PublicationStatus } from 'api/projects/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import ChangeStatusModal from './ChangeStatusModal';
import messages from './messages';
import ScheduleLaunchModal from './ScheduleLaunchModal';
import tracks from './tracks';

const getPublicationButton = ({
  publicationStatus,
  hasSchedule,
  isPending,
  canReview,
}: {
  publicationStatus: PublicationStatus;
  hasSchedule: boolean;
  isPending: boolean;
  canReview: boolean;
}) => {
  let text = messages.publish;
  let icon: 'send' | 'unlock' | 'clock' | 'lock' | 'check-circle' | 'inbox' =
    'send';
  if (publicationStatus === 'draft') {
    if (isPending && canReview) {
      text = messages.approve;
      icon = 'unlock';
    } else if (isPending) {
      text = messages.approvalRequested;
      icon = 'lock';
    } else if (hasSchedule) {
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
  const reviewState = projectReview?.data.attributes.state;

  const canReview = usePermission({ item: project, action: 'review' });
  const canModerate = usePermission({ item: project, action: 'moderate' });

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [changeStatusModalOpen, setChangeStatusModalOpen] = useState(false);

  if (!canModerate) return null;

  const { publication_status, scheduled_at } = project.attributes;
  const isDraft = publication_status === 'draft';
  const isPending = isProjectReviewEnabled && reviewState === 'pending';

  const publicationButton = getPublicationButton({
    publicationStatus: publication_status,
    hasSchedule: !!scheduled_at,
    isPending,
    canReview,
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

  return (
    <Box display="flex" gap="8px">
      <Button
        buttonStyle="admin-dark"
        icon={publicationButton.icon}
        onClick={handleEntryClick}
        size="s"
        padding="4px 8px"
        iconSize="20px"
        id="e2e-publish"
      >
        {formatMessage(publicationButton.text)}
      </Button>

      <ScheduleLaunchModal
        opened={scheduleModalOpen}
        project={project}
        onClose={() => setScheduleModalOpen(false)}
      />

      <ChangeStatusModal
        opened={changeStatusModalOpen}
        project={project}
        onClose={() => setChangeStatusModalOpen(false)}
      />
    </Box>
  );
};

export default PublicationButtons;
