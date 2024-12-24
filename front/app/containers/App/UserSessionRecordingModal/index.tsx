import React, { useState, useEffect } from 'react';

import {
  Icon,
  colors,
  Text,
  Button,
  Title,
  Box,
} from '@citizenlab/cl2-component-library';
import { get, set } from 'js-cookie';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import eventEmitter from 'utils/eventEmitter';

import messages from './messages';

const UserSessionRecordingModal = () => {
  const [modalOpened, setModalOpened] = useState(false);
  const { formatMessage } = useIntl();
  const userSessionRecodingFeatureFlag = useFeatureFlag({
    name: 'user_session_recording',
  });

  useEffect(() => {
    const shouldShowModal = () => {
      const hasSeenModal = get('user_session_recording_modal');
      const show =
        userSessionRecodingFeatureFlag &&
        hasSeenModal !== 'true' &&
        Math.random() < 0.01; // 1% chance of showing the modal
      return show;
    };

    if (shouldShowModal()) {
      setModalOpened(true);
    }
  }, [userSessionRecodingFeatureFlag]);

  const onAccept = () => {
    setModalOpened(false);
    eventEmitter.emit('user_session_recording_accepted', true);
    set('user_session_recording_modal', 'true');
  };

  const onClose = () => {
    setModalOpened(false);
    set('user_session_recording_modal', 'true');
  };

  return (
    <Modal opened={modalOpened} close={onClose}>
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
