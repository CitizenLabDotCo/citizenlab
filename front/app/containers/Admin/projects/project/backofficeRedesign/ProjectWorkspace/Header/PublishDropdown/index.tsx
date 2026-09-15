import React, { useState } from 'react';

import { Box, Icon, colors } from '@citizenlab/cl2-component-library';

import { IProjectData } from 'api/projects/types';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import ScheduleLaunchModal from '../../../../projectHeader/PublicationButtons/ScheduleLaunchModal';
import messages from '../../messages';
import HeaderDropdown from '../HeaderDropdown';

import ConfirmStatusChangeModal, {
  ConfirmableStatus,
} from './ConfirmStatusChangeModal';
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
  const [scheduleOpened, setScheduleOpened] = useState(false);
  const [confirm, setConfirm] = useState<{
    status: ConfirmableStatus;
    opened: boolean;
  } | null>(null);

  const close = () => onOpenChange(false);

  const publicationState = getPublicationState(project);
  const dotColor = TRIGGER_DOT_COLORS[publicationState];

  return (
    <>
      <HeaderDropdown
        opened={opened}
        onOpenChange={onOpenChange}
        icon="chevron-down"
        id="e2e-publish-dropdown-toggle"
        width="380px"
        label={
          <Box display="flex" alignItems="center" gap="6px">
            {dotColor && (
              <Icon name="dot" width="14px" height="14px" fill={dotColor} />
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
            onDone={close}
          />
        }
      />

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
