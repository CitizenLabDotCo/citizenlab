import { Query, QuerySchema } from 'api/analytics/types';
import useAnalytics from 'api/analytics/useAnalytics';

import useLocalize from 'hooks/useLocalize';

import {
  getProjectFilter,
  getDateFilter,
} from 'components/admin/GraphCards/_utils/query';

import { useIntl } from 'utils/cl-intl';

import {
  parsePieData,
  parseProgressBarsData,
  parseStackedBarsData,
  getPieCenterValue,
  getDays,
  getStatusColorById,
  parseStackedBarsPercentages,
  parseStackedBarsLegendItems,
  parseExcelData,
} from './parse';
import { getTranslations } from './translations';
import { QueryParameters, Response } from './typings';
import { isEmptyResponse } from './utils';

const query = ({
  projectId,
  startAtMoment,
  endAtMoment,
}: QueryParameters): Query => {
  const queryFeedback: QuerySchema = {
    fact: 'post',
    aggregations: {
      feedback_none: 'sum',
      feedback_official: 'sum',
      feedback_status_change: 'sum',
      feedback_time_taken: 'avg',
    },
    filters: {
      'dimension_type.name': 'idea',
      publication_status: 'published',
      ...getProjectFilter('dimension_project', projectId),
      ...getDateFilter('dimension_date_created', startAtMoment, endAtMoment),
    },
  };

  const queryStatus: QuerySchema = {
    fact: 'post',
    groups: 'dimension_status.id',
    aggregations: {
      all: 'count',
      'dimension_status.title_multiloc': 'first',
      'dimension_status.color': 'first',
    },
    filters: {
      'dimension_type.name': 'idea',
      publication_status: 'published',
      ...getProjectFilter('dimension_project', projectId),
      ...getDateFilter('dimension_date_created', startAtMoment, endAtMoment),
    },
  };

  return { query: [queryFeedback, queryStatus] };
};

export default function usePostsFeedback({
  projectId,
  startAtMoment,
  endAtMoment,
}: QueryParameters) {
  const { data: analytics } = useAnalytics<Response>(
    query({
      projectId,
      startAtMoment,
      endAtMoment,
    })
  );

  const localize = useLocalize();
  const { formatMessage } = useIntl();

  if (!analytics || isEmptyResponse(analytics)) {
    return null;
  }
  const [feedbackRows, statusRows] = analytics.data.attributes;

  const feedbackRow = feedbackRows[0];

  const translations = getTranslations(formatMessage);

  const pieData = parsePieData(feedbackRow);
  const progressBarsData = parseProgressBarsData(feedbackRow, translations);

  const stackedBarsData = parseStackedBarsData(statusRows);

  const pieCenterValue = getPieCenterValue(feedbackRow);

  const days = getDays(feedbackRow);

  const statusColorById = getStatusColorById(statusRows);
  const stackedBarColumns = statusRows.map((row) => row['dimension_status.id']);
  const stackedBarPercentages = parseStackedBarsPercentages(statusRows);

  const stackedBarsLegendItems = parseStackedBarsLegendItems(
    statusRows,
    localize
  );

  const xlsxData = parseExcelData(
    feedbackRow,
    statusRows,
    stackedBarPercentages,
    translations,
    localize
  );

  const postsWithFeedback = {
    pieData,
    progressBarsData,
    stackedBarsData,
    pieCenterValue,
    days,
    stackedBarColumns,
    statusColorById,
    stackedBarPercentages,
    stackedBarsLegendItems,
    xlsxData,
  };

  return postsWithFeedback;
}
