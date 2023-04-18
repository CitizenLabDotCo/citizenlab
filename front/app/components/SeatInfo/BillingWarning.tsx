import React from 'react';
import Warning from 'components/UI/Warning';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

const BillingWarning = () => {
  const { formatMessage } = useIntl();
  return <Warning>{formatMessage(messages.billingWarning)}</Warning>;
};

export default BillingWarning;
