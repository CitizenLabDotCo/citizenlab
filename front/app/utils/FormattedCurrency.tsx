import React from 'react';
import { FormattedNumber } from 'react-intl';
import useAppConfiguration from 'hooks/useAppConfiguration';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  value: number;
}

const FormattedCurrency = ({ value }: Props) => {
  const appConfiguration = useAppConfiguration();

  if (!isNilOrError(appConfiguration)) {
    const currency = appConfiguration.data.attributes.settings.core.currency;

    if (currency === 'TOK') {
    } else if (currency === 'CRE') {
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

export default FormattedCurrency;
