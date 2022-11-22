import { useEffect, useState } from 'react';

// services
import {
  analyticsStream,
  Query,
  QuerySchema,
} from '../../services/analyticsFacts';

// i18n
import useLocalize from 'hooks/useLocalize';
import { useIntl } from 'utils/cl-intl';
import { getTranslations } from './translations';

// parsing
import {
  getDays,
  getPieCenterValue,
  getStatusColorById,
  parseExcelData,
  parsePieData,
  parseProgressBarsData,
  parseStackedBarsData,
  parseStackedBarsLegendItems,
  parseStackedBarsPercentages,
} from './parse';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { isEmptyResponse } from './utils';
import { getProjectFilter, getDateFilter } from '../../utils/query';

// typings
import {
  EmptyResponse,
  PostFeedback,
  QueryParameters,
  Response,
} from './typings';

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
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const [postsWithFeedback, setPostsWithFeedback] = useState<
    PostFeedback | NilOrError
  >(undefined);

  useEffect(() => {
    const { observable } = analyticsStream<Response | EmptyResponse>(
      query({ projectId, startAtMoment, endAtMoment })
    );
    const subscription = observable.subscribe(
      (response: Response | EmptyResponse | NilOrError) => {
        if (isNilOrError(response)) {
          setPostsWithFeedback(response);
          return;
        }

        if (isEmptyResponse(response)) {
          setPostsWithFeedback(null);
          return;
        }

        const [feedbackRows, statusRows] = response.data;
        const feedbackRow = feedbackRows[0];

        const translations = getTranslations(formatMessage);

        const pieData = parsePieData(feedbackRow);
        const progressBarsData = parseProgressBarsData(
          feedbackRow,
          translations
        );

        const stackedBarsData = parseStackedBarsData(statusRows);

        const pieCenterValue = getPieCenterValue(feedbackRow);

        const days = getDays(feedbackRow);

        const statusColorById = getStatusColorById(statusRows);
        const stackedBarColumns = statusRows.map(
          (row) => row['dimension_status.id']
        );
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

        setPostsWithFeedback({
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
        });
      }
    );

    return () => subscription.unsubscribe();
  }, [projectId, startAtMoment, endAtMoment, formatMessage, localize]);

  return postsWithFeedback;
}
