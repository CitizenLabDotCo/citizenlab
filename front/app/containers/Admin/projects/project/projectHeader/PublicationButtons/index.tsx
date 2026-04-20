import React, { useState } from 'react';

import { Button, Box } from '@citizenlab/cl2-component-library';

import useProjectReview from 'api/project_reviews/useProjectReview';
import { IProjectData } from 'api/projects/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import messages from './messages';
import ScheduleLaunchModal from './ScheduleLaunchModal';
import tracks from './tracks';

type EntryIcon = 'send' | 'unlock' | 'clock' | 'lock';

const PublicationButtons = ({ project }: { project: IProjectData }) => {
  const isProjectReviewEnabled = useFeatureFlag({ name: 'project_review' });
  const { formatMessage } = useIntl();

  const { data: projectReview } = useProjectReview(project.id);
  const reviewState = projectReview?.data.attributes.state;

  const canReview = usePermission({ item: project, action: 'review' });
  const canModerate = usePermission({ item: project, action: 'moderate' });

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  if (project.attributes.first_published_at) return null;
  if (!canModerate) return null;

  const hasSchedule = !!project.attributes.scheduled_at;
  const isPending = isProjectReviewEnabled && reviewState === 'pending';

  let entryText = hasSchedule ? messages.scheduled : messages.publish;
  let entryIcon: EntryIcon = hasSchedule ? 'clock' : 'send';
  if (isPending && canReview) {
    entryText = messages.approveAndSchedule;
    entryIcon = 'unlock';
  } else if (isPending) {
    entryText = messages.approvalRequested;
    entryIcon = 'lock';
  }

  return (
    <Box display="flex" gap="8px">
      <Button
        buttonStyle="admin-dark"
        icon={entryIcon}
        onClick={() => {
          trackEventByName(tracks.scheduleLaunchModalOpened);
          setScheduleModalOpen(true);
        }}
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
    </Box>
  );
};

export default PublicationButtons;
