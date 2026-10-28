import React from 'react';

import {
  Box,
  Button,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';

import useDeleteEvent from 'api/events/useDeleteEvent';

import { usePageSave } from 'containers/Admin/projects/_shared/PageSaveContext';
import eventMessages from 'containers/Admin/projects/project/events/messages';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

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
    <Box
      position="sticky"
      bottom="0"
      zIndex="1"
      display="flex"
      mt="auto"
      mx="-18px"
      px="18px"
      py="12px"
      bgColor={colors.grey50}
      borderTop={`1px solid ${colors.grey200}`}
    >
      <Button
        buttonStyle="bo-text"
        textColor={colors.red600}
        textHoverColor={colors.red600}
        fontSize={`${fontSizes.xs}px`}
        fontWeight="600"
        padding="6px"
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
