import { FormatMessage } from 'typings';

import dashboardMessages from 'containers/Admin/dashboard/messages';

import {
  getTimePeriodTranslations,
  TimePeriodTranslations,
} from 'components/admin/GraphCards/_utils/resolution';
import moduleMessages from 'components/admin/GraphCards/messages';

import messages from './messages';

export interface Translations extends TimePeriodTranslations {
  date: string;
  inputs: string;
  timeSeries: string;
  last30Days: string;
  last7Days: string;
  yesterday: string;
}

export const getTranslations = (
  formatMessage: FormatMessage
): Translations => ({
  date: formatMessage(moduleMessages.date),
  inputs: formatMessage(dashboardMessages.inputs),
  timeSeries: formatMessage(messages.timeSeries),
  ...getTimePeriodTranslations(formatMessage),
});
