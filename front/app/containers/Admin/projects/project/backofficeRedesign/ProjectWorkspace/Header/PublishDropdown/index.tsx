import React, { useState } from 'react';

import { Box, Icon, colors } from '@citizenlab/cl2-component-library';

import { IProjectData } from 'api/projects/types';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import ScheduleLaunchModal from '../../../../projectHeader/PublicationButtons/ScheduleLaunchModal';
import messages from '../../messages';
import HeaderDropdown from '../HeaderDropdown';

import getPublicationState, { PublicationState } from './publicationState';
import PublishPanel from './PublishPanel';

const TRIGGER_MESSAGES: Record<PublicationState, MessageDescriptor> = {
  published: messages.publishButtonLive,
  scheduled: messages.publishStateScheduled,
  archived: messages.publishButton,
  draft: messages.publishButton,
};

interface Props {
  project: IProjectData;
  opened: boolean;
  onOpenChange: (opened: boolean) => void;
}

const PublishDropdown = ({ project, opened, onOpenChange }: Props) => {
  const { formatMessage } = useIntl();
  const [scheduleOpened, setScheduleOpened] = useState(false);

  const close = () => onOpenChange(false);

  const publicationState = getPublicationState(project);

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
            {publicationState === 'published' && (
              <Icon
                name="dot"
                width="14px"
                height="14px"
                fill={colors.success}
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
            onPublished={close}
          />
        }
      />

      <ScheduleLaunchModal
        opened={scheduleOpened}
        project={project}
        onClose={() => setScheduleOpened(false)}
      />
    </>
  );
};

export default PublishDropdown;
