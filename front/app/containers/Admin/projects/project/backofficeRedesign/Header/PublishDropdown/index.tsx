import React, { useState } from 'react';

import { Box, Tooltip, colors } from '@citizenlab/cl2-component-library';

import useProjectReview from 'api/project_reviews/useProjectReview';
import { IProjectData } from 'api/projects/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import publicationButtonsMessages from 'containers/Admin/projects/project/projectHeader/PublicationButtons/messages';
import ScheduleLaunchModal from 'containers/Admin/projects/project/projectHeader/PublicationButtons/ScheduleLaunchModal';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import messages from '../../messages';
import HeaderDropdown from '../HeaderDropdown';

import ConfirmStatusChangeModal, {
  ConfirmableStatus,
} from './ConfirmStatusChangeModal';
import MissingEssentialsModal from './MissingEssentialsModal';
import getPublicationState, { PublicationState } from './publicationState';
import PublishPanel from './PublishPanel';

const TRIGGER_MESSAGES: Record<PublicationState, MessageDescriptor> = {
  published: messages.publishButtonLive,
  scheduled: messages.publishStateScheduled,
  archived: messages.publishStateArchived,
  draft: messages.publishButton,
};

// A dot marks the states where the project has settled somewhere: live, or put
// away. Draft and scheduled are still on their way, so they carry none.
const TRIGGER_DOT_COLORS: Partial<Record<PublicationState, string>> = {
  published: colors.success,
  archived: colors.coolGrey500,
};

interface Props {
  project: IProjectData;
  opened: boolean;
  onOpenChange: (opened: boolean) => void;
}

const PublishDropdown = ({ project, opened, onOpenChange }: Props) => {
  const { formatMessage } = useIntl();
  const isProjectReviewEnabled = useFeatureFlag({ name: 'project_review' });
  const { data: projectReview } = useProjectReview(project.id);
  const canPublish = usePermission({
    item: project,
    action: 'publish',
    context: projectReview?.data.attributes.state === 'approved',
  });
  const [scheduleOpened, setScheduleOpened] = useState(false);
  const [missingOpened, setMissingOpened] = useState(false);
  const [confirm, setConfirm] = useState<{
    status: ConfirmableStatus;
    opened: boolean;
  } | null>(null);

  const close = () => onOpenChange(false);

  const publicationState = getPublicationState(project);
  const dotColor = TRIGGER_DOT_COLORS[publicationState];

  // A published project keeps its trigger so it can be unpublished, even by
  // someone who can't publish. The modals stay mounted either way, so one that
  // is open survives the project leaving the published state.
  const isPublished = publicationState === 'published';
  const showTrigger = !isProjectReviewEnabled || isPublished || canPublish;

  const disabled = !canPublish && !project.attributes.first_published_at;

  return (
    <>
      {showTrigger && (
        <Tooltip
          content={formatMessage(
            publicationButtonsMessages.onlyAdminsAndFolderManagersCanPublish,
            { inFolder: !!project.attributes.folder_id }
          )}
          theme="dark"
          placement="bottom"
          disabled={!disabled}
        >
          <Box>
            <HeaderDropdown
              opened={opened}
              onOpenChange={onOpenChange}
              disabled={disabled}
              buttonStyle={
                publicationState === 'published' ? 'bo-status' : 'bo-primary'
              }
              icon="chevron-down"
              id="e2e-publish-dropdown-toggle"
              width="380px"
              label={
                <Box display="flex" alignItems="center" gap="7px">
                  {dotColor && (
                    <Box
                      w="7px"
                      h="7px"
                      borderRadius="50%"
                      background={dotColor}
                    />
                  )}
                  {formatMessage(TRIGGER_MESSAGES[publicationState])}
                </Box>
              }
              content={
                <PublishPanel
                  project={project}
                  onSchedule={() => {
                    close();
                    setScheduleOpened(true);
                  }}
                  onConfirmStatusChange={(status) => {
                    close();
                    setConfirm({ status, opened: true });
                  }}
                  onMissingEssentials={() => {
                    close();
                    setMissingOpened(true);
                  }}
                  onDone={close}
                />
              }
            />
          </Box>
        </Tooltip>
      )}

      {missingOpened && (
        <MissingEssentialsModal
          opened
          project={project}
          onClose={() => setMissingOpened(false)}
        />
      )}

      <ScheduleLaunchModal
        opened={scheduleOpened}
        project={project}
        onClose={() => setScheduleOpened(false)}
      />

      {confirm && (
        <ConfirmStatusChangeModal
          opened={confirm.opened}
          status={confirm.status}
          project={project}
          onClose={() => setConfirm({ ...confirm, opened: false })}
        />
      )}
    </>
  );
};

export default PublishDropdown;
