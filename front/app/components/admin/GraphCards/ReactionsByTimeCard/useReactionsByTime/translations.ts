// i18n
import messages from './messages';
import moduleMessages from 'components/admin/GraphCards/messages';
import dashboardMessages from 'containers/Admin/dashboard/messages';
import {
  getTimePeriodTranslations,
  TimePeriodTranslations,
} from 'components/admin/GraphCards/_utils/resolution';

// typings
import { FormatMessage } from 'typings';

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
