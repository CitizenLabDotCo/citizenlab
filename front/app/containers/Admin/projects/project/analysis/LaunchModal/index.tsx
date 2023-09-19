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
import translations from './translations';

type LaunchModalProps = {
  onClose: () => void;
};

const LaunchModal = ({ onClose }: LaunchModalProps) => {
  const { formatMessage } = useIntl();
  return (
    <Box px="20px" display="flex" flexDirection="column" gap="16px">
      <Box display="flex" gap="16px" alignItems="center">
        <Icon name="flash" fill={colors.orange} width="40px" height="40px" />
        <Title>{formatMessage(translations.title)}</Title>
      </Box>
      <Box>
        <Text>{formatMessage(translations.subtitle)}</Text>
        <Text>
          <b>{formatMessage(translations.limitation1Title)}</b>{' '}
          {formatMessage(translations.limitation1Text)}
        </Text>
        <Text>
          <b>{formatMessage(translations.limitation2Title)}</b>{' '}
          {formatMessage(translations.limitation2Text)}
        </Text>
        <Text>{formatMessage(translations.description1)}</Text>
        <Text>{formatMessage(translations.description2)}</Text>
      </Box>
      <Button onClick={onClose}>
        {formatMessage(translations.agreeButton)}
      </Button>
    </Box>
  );
};

export default LaunchModal;
