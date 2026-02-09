import React from 'react';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  amount: number;
  id?: string;
}

const ScreenReaderCurrencyValue = ({ amount, id }: Props) => {
  const { formatMessage } = useIntl();
  const { data: appConfig } = useAppConfiguration();

  if (!appConfig) {
    return null;
  }

  const currency = appConfig.data.attributes.settings.core.currency;

  // An extra check to prevent the component from crashing if the message is missing
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!messages[currency]) return null;

  // We add a comma for a reading pause between the amount and the currency
  const label = `${formatMessage(messages.amount)}: ${amount},
    ${formatMessage(messages.currency)}: ${formatMessage(messages[currency])}`;

  return <ScreenReaderOnly id={id}>({label})</ScreenReaderOnly>;
};

export default ScreenReaderCurrencyValue;
