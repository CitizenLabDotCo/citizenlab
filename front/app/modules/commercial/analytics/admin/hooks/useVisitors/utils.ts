// i18n
import messages from './messages';
import cardMessages from '../../components/VisitorsCard/messages';

// typings
import { TimeSeriesResponse } from './typings';
import { IResolution } from 'components/admin/ResolutionControl';
import { WrappedComponentProps } from 'react-intl';

export const deduceResolution = (
  timeSeriesResponse: TimeSeriesResponse
): IResolution | null => {
  if (timeSeriesResponse.length === 0) return null;
  const firstRow = timeSeriesResponse[0];

  if ('dimension_date_last_action.month' in firstRow) {
    return 'month';
  }

  if ('dimension_date_last_action.week' in firstRow) {
    return 'week';
  }

  return 'day';
};

export interface Translations {
  stats: string;
  timeSeries: string;
  statistic: string;
  total: string;
  date: string;
  visitors: string;
  visits: string;
  visitDuration: string;
  pageViews: string;
  last30Days: string;
  last7Days: string;
  yesterday: string;
}

export const getTranslations = (
  formatMessage: WrappedComponentProps['intl']['formatMessage']
): Translations => ({
  stats: formatMessage(messages.stats),
  timeSeries: formatMessage(messages.timeSeries),
  statistic: formatMessage(messages.statistic),
  total: formatMessage(messages.total),
  date: formatMessage(messages.date),
  visitors: formatMessage(cardMessages.visitors),
  visits: formatMessage(cardMessages.visits),
  visitDuration: formatMessage(cardMessages.visitDuration),
  pageViews: formatMessage(cardMessages.pageViews),
  last30Days: formatMessage(cardMessages.last30Days),
  last7Days: formatMessage(cardMessages.last7Days),
  yesterday: formatMessage(cardMessages.yesterday),
});
