import { colors } from 'components/admin/Graphs/styling';

import { MessageDescriptor } from 'utils/cl-intl';

import messages from './messages';

export type SeriesKey = 'participants' | 'visitors';

/** Colour and label each line of the chart keeps, whichever lines are shown. */
export const SERIES: Record<
  SeriesKey,
  { color: string; label: MessageDescriptor }
> = {
  participants: { color: colors.categorical01, label: messages.participants },
  visitors: { color: colors.categorical03, label: messages.visitors },
};
