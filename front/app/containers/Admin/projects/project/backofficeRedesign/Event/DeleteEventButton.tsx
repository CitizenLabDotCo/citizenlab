import React from 'react';

import { Box, Button, colors } from '@citizenlab/cl2-component-library';

import useDeleteEvent from 'api/events/useDeleteEvent';

import eventMessages from 'containers/Admin/projects/project/events/messages';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import { usePageSave } from '../_shared/PageSaveContext';

import messages from './messages';

interface Props {
  projectId: string;
  eventId: string;
}

const DeleteEventButton = ({ projectId, eventId }: Props) => {
  const { formatMessage } = useIntl();
  const pageSave = usePageSave();
  const { mutate: deleteEvent, isPending } = useDeleteEvent();

  const handleDelete = () => {
    if (!window.confirm(formatMessage(eventMessages.deleteConfirmationModal))) {
      return;
    }

    deleteEvent(eventId, {
      onSuccess: () => {
        pageSave?.leave();
        clHistory.push(`/admin/projects/${projectId}`);
      },
    });
  };

  return (
    <Box display="flex" pt="16px" borderTop={`1px solid ${colors.grey200}`}>
      <Button
        buttonStyle="bo-delete"
        icon="delete"
        width="auto"
        processing={isPending}
        onClick={handleDelete}
      >
        {formatMessage(messages.deleteEvent)}
      </Button>
    </Box>
  );
};

export default DeleteEventButton;
