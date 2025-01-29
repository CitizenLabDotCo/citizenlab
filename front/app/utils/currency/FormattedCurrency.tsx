import React from 'react';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const FormattedCurrency = () => {
  const { data: appConfiguration } = useAppConfiguration();
  const { formatMessage } = useIntl();

  if (!appConfiguration) return null;

  const currency = appConfiguration.data.attributes.settings.core.currency;

  // custom implementations for custom currencies
  // see appConfiguration.ts for all currencies
  if (currency === 'TOK') {
    return <>{formatMessage(messages.tokens)}</>;
  } else if (currency === 'CRE') {
    return <>{formatMessage(messages.credits)}</>;
  } else {
    return <>{currency}</>;
  }
};

export default FormattedCurrency;
