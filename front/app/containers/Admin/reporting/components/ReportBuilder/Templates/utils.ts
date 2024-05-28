import moment from 'moment';
import { FormatMessage } from 'typings';

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
