import React, { useState } from 'react';

import StatusChip from 'design-system/StatusChip';

import { IProjectData } from 'api/projects/types';

import usePublishAccess from 'containers/Admin/projects/_shared/usePublishAccess';
import publicationButtonsMessages from 'containers/Admin/projects/project/projectHeader/PublicationButtons/messages';
import ScheduleLaunchModal from 'containers/Admin/projects/project/projectHeader/PublicationButtons/ScheduleLaunchModal';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import HeaderDropdown from '../HeaderDropdown';

import ConfirmStatusChangeModal, {
  ConfirmableStatus,
} from './ConfirmStatusChangeModal';
import messages from './messages';
import MissingEssentialsModal, {
  MissingEssentialsIntent,
} from './MissingEssentialsModal';
import getPublicationState, { PublicationState } from './publicationState';
import styles from './PublishDropdown.module.css';
import PublishPanel from './PublishPanel';
import 'design-system/tokens.css';

const TRIGGER_MESSAGES: Record<PublicationState, MessageDescriptor> = {
  published: messages.publishButtonLive,
  scheduled: messages.publishStateScheduled,
  archived: messages.publishStateArchived,
  draft: messages.publishButton,
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
  const isLive = publicationState === 'published';
  const triggerLabel = formatMessage(TRIGGER_MESSAGES[publicationState]);

  // The modals stay mounted when the trigger hides, so one that is open
  // survives the project leaving the published state.
  return (
    <>
      {/* Archived opens nothing: the project panel restores it. */}
      {showPublish && publicationState === 'archived' && (
        <StatusChip>{triggerLabel}</StatusChip>
      )}

      {showPublish && publicationState !== 'archived' && (
        <HeaderDropdown
          opened={opened}
          onOpenChange={onOpenChange}
          disabled={publishDisabled}
          disabledReason={formatMessage(
            publicationButtonsMessages.onlyAdminsAndFolderManagersCanPublish,
            { inFolder: !!project.attributes.folder_id }
          )}
          variant={isLive ? 'live' : 'primary'}
          id="e2e-publish-dropdown-toggle"
          panel="publish"
          panelLabel={triggerLabel}
          label={
            <>
              {isLive && <span className={styles.dot} aria-hidden />}
              {triggerLabel}
            </>
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
