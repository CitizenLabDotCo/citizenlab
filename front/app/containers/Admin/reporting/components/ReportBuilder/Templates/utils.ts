import moment from 'moment';
import { FormatMessage, SupportedLocale } from 'typings';

import { createMultiloc } from 'hooks/useAppConfigurationLocales';

import { MessageDescriptor } from 'utils/cl-intl';
import { FormatMessageValues } from 'utils/cl-intl/useIntl';

import messages from './messages';

export const getPeriod = ({
  startAt,
  endAt,
  formatMessage,
}: {
  startAt?: string;
  endAt?: string | null;
  formatMessage: FormatMessage;
}) => {
  if (!startAt) return undefined;

  if (endAt) {
    const startEndDates = `${moment(startAt).format('LL')} - ${moment(
      endAt
    ).format('LL')}`;

    return `<b>${formatMessage(messages.periodLabel)}</b>: ${startEndDates}`;
  }

  const startDate = moment(startAt).format('LL');
  return `<b>${formatMessage(messages.start)}</b>: ${startDate}`;
};

type FormatMessageWithLocale = (
  locale: SupportedLocale,
  messageDescriptor: MessageDescriptor,
  values?: FormatMessageValues
) => string;

export const toMultiloc = (
  message: MessageDescriptor,
  appConfigurationLocales: SupportedLocale[],
  formatMessageWithLocale: FormatMessageWithLocale,
  messageValues?: FormatMessageValues
) => {
  return createMultiloc(appConfigurationLocales, (locale) => {
    return formatMessageWithLocale(locale, message, { ...messageValues });
  });
};
