// i18n
import messages from '../messages';

// typings
import { IResolution } from 'components/admin/ResolutionControl';
import { FormatMessage } from 'typings';
import moment from 'moment';

export interface TimePeriodTranslations {
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

export const getTimePeriodMoment = (resolution: IResolution = 'month') => {
  let days = 30;
  if (resolution === 'week') days = 7;
  if (resolution === 'day') days = 1;
  return moment().subtract({ days });
};
