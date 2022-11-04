// i18n
import messages from '../messages';

// typings
import { IResolution } from 'components/admin/ResolutionControl';
import { FormatMessage } from 'typings';

export const resolutionDeducer =
  <Row>(columnPrefix: string) =>
  (series: Row[]): IResolution | null => {
    if (series.length === 0) return null;
    const firstRow = series[0];

    if (`${columnPrefix}.month` in firstRow) {
      return 'month';
    }

    if (`${columnPrefix}.week` in firstRow) {
      return 'week';
    }

    return 'day';
  };

interface TimePeriodTranslations {
  last30Days: string;
  last7Days: string;
  yesterday: string;
}

export const getTimePeriodTranslations = (
  formatMessage: FormatMessage
): TimePeriodTranslations => ({
  last30Days: formatMessage(messages.last30Days),
  last7Days: formatMessage(messages.last7Days),
  yesterday: formatMessage(messages.yesterday),
});

export const RESOLUTION_TO_MESSAGE_KEY: Record<
  IResolution,
  keyof TimePeriodTranslations
> = {
  month: 'last30Days',
  week: 'last7Days',
  day: 'yesterday',
};

export const getTimePeriodTranslationByResolution = (
  formatMessage: FormatMessage,
  resolution: IResolution
) => {
  return formatMessage(messages[RESOLUTION_TO_MESSAGE_KEY[resolution]]);
};
