import React from 'react';
import Warning from 'components/UI/Warning';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { Box, BoxMarginProps } from '@citizenlab/cl2-component-library';

const BillingWarning = (boxMarginProps: BoxMarginProps) => {
  const { formatMessage } = useIntl();
  const hasSeatBasedBillingEnabled = useFeatureFlag({
    name: 'seat_based_billing',
  });

  if (!hasSeatBasedBillingEnabled) return null;

  return (
    <Box {...boxMarginProps}>
      <Warning>{formatMessage(messages.billingWarning)}</Warning>
    </Box>
  );
};

export default BillingWarning;
