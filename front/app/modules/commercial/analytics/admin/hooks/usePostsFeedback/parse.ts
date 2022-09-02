// styling
import { colors } from 'components/admin/Graphs/styling';

// i18n
import messages from './messages';

// utils
import { sum, roundPercentage, roundPercentages } from 'utils/math';

// typings
import { FeedbackRow, StatusRow, StackedBarsRow } from '.';
import { InjectedIntlProps } from 'react-intl';
import { Localize } from 'hooks/useLocalize';
import { LegendItem } from 'components/admin/Graphs/_components/Legend/typings';

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

export const parseStackedBarsData = (
  statusRows: StatusRow[]
): [StackedBarsRow] => {
  return [
    statusRows.reduce(
      (acc, row) => ({
        ...acc,
        [row['status.id']]: row.count,
      }),
      {}
    ),
  ];
};

export const parseStackedBarsPercentages = (statusRows: StatusRow[]) => {
  const counts = statusRows.map((statusRow) => statusRow.count);
  return roundPercentages(counts);
};

export const getStatusColorById = (statusRows: StatusRow[]) => {
  return statusRows.reduce(
    (acc, row) => ({
      ...acc,
      [row['status.id']]: row.first_status_color,
    }),
    {}
  );
};

export const parseStackedBarsLegendItems = (
  statusRows: StatusRow[],
  localize: Localize
): LegendItem[] => {
  return statusRows.map((statusRow) => ({
    icon: 'circle',
    color: statusRow.first_status_color,
    label: localize(statusRow.first_status_title_multiloc),
  }));
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
