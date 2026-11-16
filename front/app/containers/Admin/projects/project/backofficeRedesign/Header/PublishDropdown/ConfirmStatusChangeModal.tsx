import React from 'react';

import { IProjectData, PublicationStatus } from 'api/projects/types';
import useUpdateProject from 'api/projects/useUpdateProject';

import Modal from 'design-system/Modal';
import 'design-system/tokens.css';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import backofficeRedesignMessages from '../../messages';

import messages from './messages';
import styles from './PublishDropdown.module.css';

export type ConfirmableStatus = 'draft' | 'archived';

const COPY: Record<
  ConfirmableStatus,
  { title: MessageDescriptor; confirm: MessageDescriptor }
> = {
  draft: {
    title: messages.publishRestoreToDraftTitle,
    confirm: backofficeRedesignMessages.publishRestoreToDraft,
  },
  archived: {
    title: messages.publishArchiveTitle,
    confirm: messages.publishMoveToArchive,
  },
};

const getBodyMessage = (
  target: ConfirmableStatus,
  current: PublicationStatus
): MessageDescriptor => {
  if (target === 'archived') return messages.publishArchiveBody2;

  return current === 'archived'
    ? messages.publishRestoreToDraftFromArchiveBody
    : messages.publishRestoreToDraftBody2;
};

interface Props {
  opened: boolean;
  status: ConfirmableStatus;
  project: IProjectData;
  onClose: () => void;
}

const ConfirmStatusChangeModal = ({
  opened,
  status,
  project,
  onClose,
}: Props) => {
  const { formatMessage } = useIntl();
  const { mutate: updateProject, isPending } = useUpdateProject();

  const copy = COPY[status];
  const body = getBodyMessage(status, project.attributes.publication_status);

  const confirm = () =>
    updateProject(
      {
        projectId: project.id,
        admin_publication_attributes: { publication_status: status },
      },
      { onSuccess: onClose }
    );

  return (
    <Modal
      size={560}
      isOpen={opened}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      title={formatMessage(copy.title)}
      secondaryAction={{
        label: formatMessage(messages.publishCancel),
        onPress: onClose,
        isDisabled: isPending,
      }}
      primaryAction={{
        label: formatMessage(copy.confirm),
        onPress: confirm,
        isPending,
      }}
    >
      <p className={styles.modalText}>{formatMessage(body)}</p>
    </Modal>
  );
};

export default ConfirmStatusChangeModal;
