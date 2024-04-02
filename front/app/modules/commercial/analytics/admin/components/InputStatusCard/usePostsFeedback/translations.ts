import { FormatMessage } from 'typings';

import messages from './messages';

export interface Translations {
  statusChanged: string;
  officialUpdate: string;
  feedbackGiven: string;
  total: string;
  averageTimeColumnName: string;
  inputStatus: string;
  responseTime: string;
  inputsByStatus: string;
  status: string;
  numberOfInputs: string;
  percentageOfInputs: string;
}

export const getTranslations = (
  formatMessage: FormatMessage
): Translations => ({
  statusChanged: formatMessage(messages.statusChanged),
  officialUpdate: formatMessage(messages.officialUpdate),
  feedbackGiven: formatMessage(messages.feedbackGiven),
  total: formatMessage(messages.total),
  averageTimeColumnName: formatMessage(messages.averageTimeColumnName),
  inputStatus: formatMessage(messages.inputStatus),
  responseTime: formatMessage(messages.responseTime),
  inputsByStatus: formatMessage(messages.inputsByStatus),
  status: formatMessage(messages.status),
  numberOfInputs: formatMessage(messages.numberOfInputs),
  percentageOfInputs: formatMessage(messages.percentageOfInputs),
});
