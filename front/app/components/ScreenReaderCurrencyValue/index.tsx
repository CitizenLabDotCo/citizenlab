import React from 'react';

import { TCurrency } from 'api/app_configuration/types';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  amount: number;
  currency?: TCurrency;
}

const ScreenReaderCurrencyValue = ({ amount, currency }: Props) => {
  const { formatMessage } = useIntl();

  // We add a comma for a reading pause between the amount and the currency
  const currencyLabel = currency
    ? `, ${formatMessage(messages.currency)}: ${formatMessage(
        messages[currency]
      )}`
    : '';

  return (
    <span
      aria-label={`${formatMessage(
        messages.amount
      )}: ${amount}${currencyLabel}`}
    >
      <ScreenReaderOnly>
        ({formatMessage(messages.amount)}: {amount}
        {currencyLabel})
      </ScreenReaderOnly>
    </span>
  );
};

export default ScreenReaderCurrencyValue;
