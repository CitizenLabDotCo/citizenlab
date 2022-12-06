import React from 'react';
import { WrappedComponentProps } from 'react-intl';
import useAppConfiguration from 'hooks/useAppConfiguration';
// i18n
import { injectIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import messages from './messages';

const FormattedCurrency = ({
  intl: { formatMessage },
}: WrappedComponentProps) => {
  const appConfiguration = useAppConfiguration();

  if (!isNilOrError(appConfiguration)) {
    const currency = appConfiguration.attributes.settings.core.currency;

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
