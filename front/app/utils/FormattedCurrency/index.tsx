import React from 'react';
import useAppConfiguration from 'hooks/useAppConfiguration';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps, FormattedNumber } from 'react-intl';
import messages from './messages';

interface Props {
  value: number;
}

const FormattedCurrency = ({
  value,
  intl: { formatMessage, formatNumber },
}: Props & InjectedIntlProps) => {
  const appConfiguration = useAppConfiguration();

  if (!isNilOrError(appConfiguration)) {
    const currency = appConfiguration.data.attributes.settings.core.currency;

    // custom implementations for custom currencies
    // see appConfiguration.ts for all currencies
    if (currency === 'TOK') {
      return (
        <>
          {formatMessage(
            value === 1 ? messages.oneToken : messages.multipleTokens,
            {
              numberOfTokens: formatNumber(value),
            }
          )}
        </>
      );
    } else if (currency === 'CRE') {
      return (
        <>
          {formatMessage(
            value === 1 ? messages.oneCredit : messages.multipleCredits,
            {
              numberOfCredits: formatNumber(value),
            }
          )}
        </>
      );
    } else {
      return (
        <FormattedNumber
          value={value}
          style="currency"
          currency={currency}
          minimumFractionDigits={0}
          maximumFractionDigits={0}
        />
      );
    }
  }

  return null;
};

export default injectIntl(FormattedCurrency);
