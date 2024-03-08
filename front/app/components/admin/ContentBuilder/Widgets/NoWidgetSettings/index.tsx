import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

export const NoWidgetSettings = () => {
  const { formatMessage } = useIntl();
  return (
    <Box background="#ffffff" marginBottom="20px">
      {formatMessage(messages.noSettings)}
    </Box>
  );
};
