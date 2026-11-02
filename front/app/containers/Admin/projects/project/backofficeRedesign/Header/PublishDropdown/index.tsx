import React, { useState } from 'react';

import { Box, Tooltip, colors } from '@citizenlab/cl2-component-library';

import { IProjectData } from 'api/projects/types';

import usePublishAccess from 'containers/Admin/projects/_shared/usePublishAccess';
import publicationButtonsMessages from 'containers/Admin/projects/project/projectHeader/PublicationButtons/messages';
import ScheduleLaunchModal from 'containers/Admin/projects/project/projectHeader/PublicationButtons/ScheduleLaunchModal';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from '../../messages';
import HeaderDropdown from '../HeaderDropdown';

import ConfirmStatusChangeModal, {
  ConfirmableStatus,
} from './ConfirmStatusChangeModal';
import MissingEssentialsModal, {
  MissingEssentialsIntent,
} from './MissingEssentialsModal';
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
  const { showPublish, publishDisabled } = usePublishAccess(project);
  const [scheduleOpened, setScheduleOpened] = useState(false);
  const [missingIntent, setMissingIntent] =
    useState<MissingEssentialsIntent | null>(null);
  const [confirm, setConfirm] = useState<{
    status: ConfirmableStatus;
    opened: boolean;
  } | null>(null);

  const close = () => onOpenChange(false);

  const publicationState = getPublicationState(project);
  const dotColor = TRIGGER_DOT_COLORS[publicationState];

  // The modals stay mounted when the trigger hides, so one that is open
  // survives the project leaving the published state.
  return (
    <>
      {showPublish && (
        <Tooltip
          content={formatMessage(
            publicationButtonsMessages.onlyAdminsAndFolderManagersCanPublish,
            { inFolder: !!project.attributes.folder_id }
          )}
          theme="dark"
          placement="bottom"
          disabled={!publishDisabled}
        >
          <Box>
            <HeaderDropdown
              opened={opened}
              onOpenChange={onOpenChange}
              disabled={publishDisabled}
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
                  onMissingEssentials={(intent) => {
                    close();
                    setMissingIntent(intent);
                  }}
                  onDone={close}
                />
              }
            />
          </Box>
        </Tooltip>
      )}

      {missingIntent && (
        <MissingEssentialsModal
          opened
          intent={missingIntent}
          project={project}
          onClose={() => setMissingIntent(null)}
          onSchedule={() => setScheduleOpened(true)}
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
