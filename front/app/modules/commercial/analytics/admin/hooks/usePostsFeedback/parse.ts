// styling
import { colors } from 'components/admin/Graphs/styling';

// i18n
import messages from './messages';

// utils
import { sum, roundPercentage } from 'utils/math';

// typings
import { FeedbackRow } from '../../services/analyticsFacts';
import { InjectedIntlProps } from 'react-intl';

interface Translations {
  statusChanged: string;
  officialUpdate: string;
  feedbackGiven: string;
  total: string;
  averageTimeColumnName: string;
  postFeedback: string;
  responseTime: string;
}

export const getTranslations = (
  formatMessage: InjectedIntlProps['intl']['formatMessage']
): Translations => ({
  statusChanged: formatMessage(messages.statusChanged),
  officialUpdate: formatMessage(messages.officialUpdate),
  feedbackGiven: formatMessage(messages.feedbackGiven),
  total: formatMessage(messages.total),
  averageTimeColumnName: formatMessage(messages.averageTimeColumnName),
  postFeedback: formatMessage(messages.postFeedback),
  responseTime: formatMessage(messages.responseTime),
});

export const parsePieData = (feedbackRow: FeedbackRow) => {
  const {
    sum_feedback_none,
    sum_feedback_official,
    sum_feedback_status_change,
  } = feedbackRow;

  const feedbackCount = sum([
    sum_feedback_official,
    sum_feedback_status_change,
  ]);

  const pieData = [
    {
      name: 'sum_feedback',
      value: feedbackCount,
      color: colors.lightBlue,
    },
    {
      name: 'sum_no_feedback',
      value: sum_feedback_none,
      color: colors.lightGrey,
    },
  ];

  return pieData;
};

export const parseProgressBarsData = (
  feedbackRow: FeedbackRow,
  { statusChanged, officialUpdate }: Translations
) => {
  const {
    sum_feedback_none,
    sum_feedback_official,
    sum_feedback_status_change,
  } = feedbackRow;

  const feedbackCount = sum([
    sum_feedback_official,
    sum_feedback_status_change,
  ]);

  const total = sum([feedbackCount, sum_feedback_none]);

  const progressBarsData = [
    {
      name: statusChanged,
      label: `${statusChanged}: ${sum_feedback_status_change} (${roundPercentage(
        sum_feedback_status_change,
        total
      )}%)`,
      value: sum_feedback_status_change,
      total,
    },
    {
      name: officialUpdate,
      label: `${officialUpdate}: ${sum_feedback_official} (${roundPercentage(
        sum_feedback_official,
        total
      )}%)`,
      value: sum_feedback_official,
      total,
    },
  ];

  return progressBarsData;
};

export const parseExcelData = (
  feedbackRow: FeedbackRow,
  {
    feedbackGiven,
    statusChanged,
    officialUpdate,
    total,
    averageTimeColumnName,
    postFeedback,
    responseTime,
  }: Translations
) => {
  const {
    sum_feedback_none,
    sum_feedback_official,
    sum_feedback_status_change,
    avg_feedback_time_taken,
  } = feedbackRow;

  const feedbackCount = sum([
    sum_feedback_official,
    sum_feedback_status_change,
  ]);

  const totalFeedback = sum([feedbackCount, sum_feedback_none]);
  const days = Math.round(avg_feedback_time_taken / 86400);

  const xlsxDataSheet1Row1 = {
    [feedbackGiven]: feedbackCount,
    [statusChanged]: sum_feedback_status_change,
    [officialUpdate]: sum_feedback_official,
    [total]: totalFeedback,
  };

  const xlsxDataSheet2Row1 = {
    [averageTimeColumnName]: days,
  };

  const xlsxData = {
    [postFeedback]: [xlsxDataSheet1Row1],
    [responseTime]: [xlsxDataSheet2Row1],
  };

  return xlsxData;
};

export const getPieCenterValue = (feedbackRow: FeedbackRow) => {
  const {
    sum_feedback_none,
    sum_feedback_official,
    sum_feedback_status_change,
  } = feedbackRow;

  const feedbackCount = sum([
    sum_feedback_official,
    sum_feedback_status_change,
  ]);

  const totalFeedback = sum([feedbackCount, sum_feedback_none]);

  return `${roundPercentage(feedbackCount, totalFeedback)}%`;
};

const SECONDS_PER_DAY = 86400;

export const getDays = ({ avg_feedback_time_taken }: FeedbackRow) => {
  return Math.round(avg_feedback_time_taken / SECONDS_PER_DAY);
};
