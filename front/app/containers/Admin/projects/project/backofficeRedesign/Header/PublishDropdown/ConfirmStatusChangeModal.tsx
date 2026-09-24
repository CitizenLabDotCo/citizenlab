import React from 'react';

import { Box, NewBOButton, NewBOText } from '@citizenlab/cl2-component-library';

import { IProjectData, PublicationStatus } from 'api/projects/types';
import useUpdateProject from 'api/projects/useUpdateProject';

import Modal from 'components/UI/Modal';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from '../../messages';

export type ConfirmableStatus = 'draft' | 'archived';

const COPY: Record<
  ConfirmableStatus,
  { title: MessageDescriptor; confirm: MessageDescriptor }
> = {
  draft: {
    title: messages.publishRestoreToDraftTitle,
    confirm: messages.publishRestoreToDraft,
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
  if (target === 'archived') return messages.publishArchiveBody;

  return current === 'archived'
    ? messages.publishRestoreToDraftFromArchiveBody
    : messages.publishRestoreToDraftBody;
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
      opened={opened}
      close={onClose}
      header={formatMessage(copy.title)}
      footer={
        <Box display="flex" justifyContent="flex-end" gap="8px" w="100%">
          <NewBOButton
            buttonStyle="secondary-outlined"
            onClick={onClose}
            disabled={isPending}
          >
            {formatMessage(messages.publishCancel)}
          </NewBOButton>
          <NewBOButton
            buttonStyle="admin-dark"
            onClick={confirm}
            processing={isPending}
          >
            {formatMessage(copy.confirm)}
          </NewBOButton>
        </Box>
      }
    >
      <Box p="28px">
        <NewBOText variant="helper">{formatMessage(body)}</NewBOText>
      </Box>
    </Modal>
  );
};

export default ConfirmStatusChangeModal;
