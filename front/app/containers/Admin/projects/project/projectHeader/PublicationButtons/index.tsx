import React, { useState } from 'react';

import { Button, Box } from '@citizenlab/cl2-component-library';

import useProjectReview from 'api/project_reviews/useProjectReview';
import { IProjectData } from 'api/projects/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import ChangeStatusModal from './ChangeStatusModal';
import messages from './messages';
import ScheduleLaunchModal from './ScheduleLaunchModal';
import tracks from './tracks';

type EntryIcon =
  | 'send'
  | 'unlock'
  | 'clock'
  | 'lock'
  | 'check-circle'
  | 'inbox';

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
  const hasSchedule = !!scheduled_at;
  const isPending = isProjectReviewEnabled && reviewState === 'pending';

  let entryText = messages.publish;
  let entryIcon: EntryIcon = 'send';
  if (isDraft) {
    if (isPending && canReview) {
      entryText = messages.approveAndSchedule;
      entryIcon = 'unlock';
    } else if (isPending) {
      entryText = messages.approvalRequested;
      entryIcon = 'lock';
    } else if (hasSchedule) {
      entryText = messages.scheduled;
      entryIcon = 'clock';
    }
  } else if (publication_status === 'published') {
    entryText = messages.published;
    entryIcon = 'check-circle';
  } else {
    entryText = messages.archived;
    entryIcon = 'inbox';
  }

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
        icon={entryIcon}
        onClick={handleEntryClick}
        size="s"
        padding="4px 8px"
        iconSize="20px"
        id="e2e-publish"
      >
        {formatMessage(entryText)}
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
