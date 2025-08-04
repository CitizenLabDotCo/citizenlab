import React from 'react';

import {
  Icon,
  colors,
  Text,
  Button,
  Title,
  Box,
} from '@citizenlab/cl2-component-library';
import { set } from 'js-cookie';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import eventEmitter from 'utils/eventEmitter';

import { useModalQueue } from '../..';

import messages from './messages';

const UserSessionRecordingModal = () => {
  const { removeModal } = useModalQueue();

  const { formatMessage } = useIntl();

  const onAccept = () => {
    set('user_session_recording_modal', 'true');
    eventEmitter.emit('user_session_recording_accepted', true);
    removeModal('user-session-recording');
  };

  const onClose = () => {
    set('user_session_recording_modal', 'true');
    removeModal('user-session-recording');
  };

  return (
    <Modal opened close={onClose}>
      <Box p="24px">
        <Box display="flex" gap="16px" alignItems="center">
          <Icon
            name="alert-circle"
            fill={colors.green500}
            width="40px"
            height="40px"
          />
          <Title>{formatMessage(messages.modalTitle)}</Title>
        </Box>

        <Text fontSize="l">{formatMessage(messages.modalDescription1)}</Text>
        <Text fontSize="l">
          {formatMessage(messages.modalDescription2)}{' '}
          <Link
            to="https://docs.google.com/document/d/1a1hlDcMHIJrSJb2sD1AenOGfWpjxcsrzkjrDhlTtzNw"
            target="_blank"
          >
            {formatMessage(messages.modalDescriptionFaq)}
          </Link>
        </Text>
        <Text fontSize="l">{formatMessage(messages.modalDescription3)}</Text>

        <Box display="flex" justifyContent="flex-end" gap="16px" mt="48px">
          <Button buttonStyle="secondary-outlined" onClick={onClose}>
            {formatMessage(messages.reject)}
          </Button>
          <Button buttonStyle="primary" onClick={onAccept}>
            {formatMessage(messages.accept)}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default UserSessionRecordingModal;
