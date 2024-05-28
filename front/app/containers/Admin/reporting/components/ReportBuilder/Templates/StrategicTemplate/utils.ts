import { FormatMessage } from 'typings';

import { getComparedTimeRange } from 'components/admin/GraphCards/_utils/query';

import messages from './messages';

export const createGSQuote = (formatMessage: FormatMessage) => {
  const quote = `<p><strong>${formatMessage(
    messages.placeholderQuote
  )}</strong></p>`;
  const manager = `<p class="ql-align-center"><strong>(NAME), ${formatMessage(
    messages.clGSManager
  )}</strong></p>`;

  return `${quote}\n${manager}`;
};

export const getComparedDateRange = ({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) => {
  const { compare_start_at, compare_end_at } = getComparedTimeRange(
    startDate,
    endDate
  );

  return {
    compareStartAt: compare_start_at,
    compareEndAt: compare_end_at,
  };
};
