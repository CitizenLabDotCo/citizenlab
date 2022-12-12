import { injectIntl } from '../../../../../utils/cl-intl';
import { Box } from '@citizenlab/cl2-component-library';
import messages from './messages';
import React from 'react';

export const NoWidgetSettings = injectIntl(({ intl: { formatMessage } }) => {
  return (
    <Box background="#ffffff" marginBottom="20px">
      {formatMessage(messages.noSettings)}
    </Box>
  );
});
