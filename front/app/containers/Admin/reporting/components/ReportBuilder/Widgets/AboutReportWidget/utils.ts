import moment from 'moment';
import messages from './messages';
import { FormatMessage } from 'typings';

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

    return formatMessage(messages.periodLabel, {
      startEndDates,
    });
  }

  const startDate = moment(startAt).format('LL');
  return formatMessage(messages.start, { startDate });
};
