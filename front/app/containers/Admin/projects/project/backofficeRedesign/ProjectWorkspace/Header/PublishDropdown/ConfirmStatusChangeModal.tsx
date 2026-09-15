import React from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';

import { IProjectData, PublicationStatus } from 'api/projects/types';
import useUpdateProject from 'api/projects/useUpdateProject';

import Modal from 'components/UI/Modal';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from '../../messages';

export type ConfirmableStatus = 'draft' | 'archived';

const COPY: Record<
  ConfirmableStatus,
  { title: MessageDescriptor; confirm: MessageDescriptor; id: string }
> = {
  draft: {
    title: messages.publishRestoreToDraftTitle,
    confirm: messages.publishRestoreToDraft,
    id: 'e2e-confirm-restore-to-draft',
  },
  archived: {
    title: messages.publishArchiveTitle,
    confirm: messages.publishMoveToArchive,
    id: 'e2e-confirm-move-to-archive',
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
      header={
        <Text fontSize="xl" fontWeight="bold" m="0px">
          {formatMessage(copy.title)}
        </Text>
      }
      footer={
        <Box display="flex" justifyContent="flex-end" gap="8px" w="100%">
          <Button
            buttonStyle="secondary-outlined"
            onClick={onClose}
            disabled={isPending}
          >
            {formatMessage(messages.publishCancel)}
          </Button>
          <Button
            buttonStyle="admin-dark"
            onClick={confirm}
            processing={isPending}
            id={copy.id}
          >
            {formatMessage(copy.confirm)}
          </Button>
        </Box>
      }
    >
      <Box p="28px">
        <Text m="0" color="textPrimary">
          {formatMessage(body)}
        </Text>
      </Box>
    </Modal>
  );
};

export default ConfirmStatusChangeModal;
