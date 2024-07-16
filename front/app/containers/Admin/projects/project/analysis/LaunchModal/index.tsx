import React from 'react';

import {
  Button,
  Title,
  Box,
  Icon,
  colors,
  Text,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type LaunchModalProps = {
  onClose: () => void;
};

const LaunchModal = ({ onClose }: LaunchModalProps) => {
  const { formatMessage } = useIntl();
  return (
    <Box
      px="20px"
      display="flex"
      flexDirection="column"
      gap="16px"
      id="e2e-analysis-launch-modal"
    >
      <Box display="flex" gap="16px" alignItems="center">
        <Icon name="stars" fill={colors.orange500} width="40px" height="40px" />
        <Title>{formatMessage(messages.title)}</Title>
      </Box>
      <Box>
        <Text>{formatMessage(messages.subtitle)}</Text>
        <Text>
          <b>{formatMessage(messages.limitation1Title)}</b>{' '}
          {formatMessage(messages.limitation1Text)}
        </Text>
        <Text>
          <b>{formatMessage(messages.limitation2Title)}</b>{' '}
          {formatMessage(messages.limitation2Text)}
        </Text>
        <Text>
          <b>{formatMessage(messages.limitation3Title)}</b>{' '}
          {formatMessage(messages.limitation3Text)}
        </Text>
        <Text>{formatMessage(messages.description)}</Text>
      </Box>
      <Button id="e2e-analysis-launch-modal-agree-button" onClick={onClose}>
        {formatMessage(messages.agreeButton)}
      </Button>
    </Box>
  );
};

export default LaunchModal;
