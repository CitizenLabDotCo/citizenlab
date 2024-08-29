import React from 'react';

import { WrappedComponentProps } from 'react-intl';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import { injectIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';

const FormattedCurrency = ({
  intl: { formatMessage },
}: WrappedComponentProps) => {
  const { data: appConfiguration } = useAppConfiguration();

  if (!isNilOrError(appConfiguration)) {
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
  }

  return null;
};

export default injectIntl(FormattedCurrency);
