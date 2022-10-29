// i18n
import messages from './messages';

// typings
import { Response, EmptyResponse } from './typings';
import { WrappedComponentProps } from 'react-intl';

export const isEmptyResponse = (
  response: Response | EmptyResponse
): response is EmptyResponse => {
  const [feedbackRows, statusRows] = response.data;
  const feedbackRow = feedbackRows[0];

  return (
    Object.values(feedbackRow).every((value) => value === null) ||
    statusRows.length === 0
  );
};

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
  formatMessage: WrappedComponentProps['intl']['formatMessage']
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
