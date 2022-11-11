// i18n
import messages from '../messages';
import { isMonth, isWeek } from './timeSeries';

// typings
import { IResolution } from 'components/admin/ResolutionControl';
import { FormatMessage } from 'typings';
import { DateRow, DateColumn } from '../typings';

export const resolutionDeducer =
  <Prefix extends string>(prefix: Prefix) =>
  (series: DateRow<Prefix>[]): IResolution | null =>
    deduceResolution(series[0], prefix);

const deduceResolution = <Prefix extends string>(
  row: DateRow<Prefix>,
  prefix: Prefix
): IResolution => {
  const monthColumn: DateColumn<Prefix, 'month'> = `${prefix}.month`;
  if (isMonth(row, monthColumn)) return 'month';

  const weekColumn: DateColumn<Prefix, 'week'> = `${prefix}.week`;
  if (isWeek(row, weekColumn)) return 'week';

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
