import React from 'react';

import Modal from 'design-system/Modal';

import { IProjectData } from 'api/projects/types';

import ReadyMark from 'containers/Admin/projects/project/backofficeRedesign/ProjectSetupPanel/ReadyMark';
import {
  getMissingItems,
  SETUP_ITEMS,
} from 'containers/Admin/projects/project/backofficeRedesign/ProjectSetupPanel/setupItems';
import useSetupReadiness from 'containers/Admin/projects/project/backofficeRedesign/ProjectSetupPanel/useSetupReadiness';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from './messages';
import styles from './PublishDropdown.module.css';
import usePublishNow from './usePublishNow';
import 'design-system/tokens.css';

export type MissingEssentialsIntent = 'publish' | 'schedule';

const INTENT_MESSAGES: Record<
  MissingEssentialsIntent,
  { title: MessageDescriptor; confirm: MessageDescriptor }
> = {
  publish: {
    title: messages.publishMissingTitle,
    confirm: messages.publishMissingConfirm,
  },
  schedule: {
    title: messages.publishMissingScheduleTitle,
    confirm: messages.publishMissingScheduleConfirm,
  },
};

interface Props {
  opened: boolean;
  intent: MissingEssentialsIntent;
  project: IProjectData;
  onClose: () => void;
  onSchedule: () => void;
}

const MissingEssentialsModal = ({
  opened,
  intent,
  project,
  onClose,
  onSchedule,
}: Props) => {
  const { formatMessage } = useIntl();
  const { publishNow, isPending } = usePublishNow(project);

  const missing = getMissingItems(useSetupReadiness(project).readiness);

  const handleConfirm = () => {
    if (intent === 'schedule') {
      onClose();
      onSchedule();
      return;
    }
    publishNow(onClose);
  };

  return (
    <Modal
      size={560}
      isOpen={opened}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      title={formatMessage(INTENT_MESSAGES[intent].title)}
      secondaryAction={{
        label: formatMessage(messages.publishMissingBack),
        onPress: onClose,
        isDisabled: isPending,
      }}
      primaryAction={{
        label: formatMessage(INTENT_MESSAGES[intent].confirm),
        onPress: handleConfirm,
        isPending,
        id: 'e2e-publish-anyway',
      }}
    >
      <p className={styles.modalText}>
        {formatMessage(messages.publishMissingBody, {
          missing: missing.length,
          total: SETUP_ITEMS.length,
        })}
      </p>
      <ul className={styles.missingList}>
        {missing.map(({ key, label }) => (
          <li key={key} className={styles.missingItem}>
            <ReadyMark ready={false} />
            {formatMessage(label)}
          </li>
        ))}
      </ul>
    </Modal>
  );
};

export default MissingEssentialsModal;
