import React from 'react';

import { Box, BoxMarginProps } from '@citizenlab/cl2-component-library';

import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const BillingWarning = (boxMarginProps: BoxMarginProps) => {
  const { formatMessage } = useIntl();

  return (
    <Box {...boxMarginProps}>
      <Warning>{formatMessage(messages.billingWarning)}</Warning>
    </Box>
  );
};

export default BillingWarning;
