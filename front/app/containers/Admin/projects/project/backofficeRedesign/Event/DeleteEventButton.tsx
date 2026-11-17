import React, { useState } from 'react';

import useDeleteEvent from 'api/events/useDeleteEvent';

import eventMessages from 'containers/Admin/projects/project/events/messages';

import { usePageSave } from 'components/admin/PageSaveContext';

import AlertDialog from 'design-system/AlertDialog';
import Button from 'design-system/Button';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import styles from './DeleteEventButton.module.css';
import messages from './messages';
import 'design-system/tokens.css';

interface Props {
  projectId: string;
  eventId: string;
}

const DeleteEventButton = ({ projectId, eventId }: Props) => {
  const { formatMessage } = useIntl();
  const pageSave = usePageSave();
  const { mutate: deleteEvent, isPending } = useDeleteEvent();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = () => {
    deleteEvent(eventId, {
      onSuccess: () => {
        setConfirmOpen(false);
        pageSave?.leave();
        clHistory.push(`/admin/projects/${projectId}`);
      },
    });
  };

  return (
    <div className={styles.footer}>
      <Button variant="danger" size={32} onPress={() => setConfirmOpen(true)}>
        {formatMessage(messages.deleteEvent)}
      </Button>
      <AlertDialog
        isOpen={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={formatMessage(messages.deleteEvent)}
        confirmLabel={formatMessage(messages.deleteEvent)}
        onConfirm={handleDelete}
        isPending={isPending}
      >
        {formatMessage(eventMessages.deleteConfirmationModal)}
      </AlertDialog>
    </div>
  );
};

export default DeleteEventButton;
