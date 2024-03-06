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
  likes: string;
  dislikes: string;
  timeSeries: string;
}

export const getTranslations = (
  formatMessage: FormatMessage
): Translations => ({
  date: formatMessage(moduleMessages.date),
  likes: formatMessage(dashboardMessages.numberOfLikes),
  dislikes: formatMessage(dashboardMessages.numberOfDislikes),
  timeSeries: formatMessage(messages.timeSeries),
  ...getTimePeriodTranslations(formatMessage),
});
