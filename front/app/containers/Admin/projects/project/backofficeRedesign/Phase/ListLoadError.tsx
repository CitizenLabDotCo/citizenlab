import React from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  onRetry: () => void;
  message?: string;
  retryLabel?: string;
}

const ListLoadError = ({ onRetry, message, retryLabel }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box role="alert">
      <Text variant="boHelper">
        {message ?? formatMessage(messages.listLoadFailed)}
      </Text>
      <Button buttonStyle="bo-secondary" onClick={onRetry}>
        {retryLabel ?? formatMessage(messages.retryListLoad)}
      </Button>
    </Box>
  );
};

export default ListLoadError;
