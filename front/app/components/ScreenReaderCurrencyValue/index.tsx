import React from 'react';

import { TCurrency } from 'api/app_configuration/types';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  amount: number;
  currency: TCurrency;
}

const ScreenReaderCurrencyValue = ({ amount, currency }: Props) => {
  const { formatMessage } = useIntl();

  // An extra check to prevent the component from crashing if the message is missing
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!messages[currency]) return null;

  // We add a comma for a reading pause between the amount and the currency
  const label = `${formatMessage(messages.amount)}: ${amount},
    ${formatMessage(messages.currency)}: ${formatMessage(messages[currency])}`;

  return <ScreenReaderOnly>({label})</ScreenReaderOnly>;
};

export default ScreenReaderCurrencyValue;
