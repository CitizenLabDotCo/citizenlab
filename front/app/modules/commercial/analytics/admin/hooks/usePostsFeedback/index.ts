import { useState, useEffect } from 'react';

// services
import {
  analyticsStream,
  Query,
  QuerySchema,
} from '../../services/analyticsFacts';

// i18n
import useLocalize from 'hooks/useLocalize';
import { useIntl } from 'utils/cl-intl';

// parsing
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

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { isEmptyResponse, getTranslations } from './utils';
import { getProjectFilter, getDateFilter } from '../../utils/query';

// typings
import {
  QueryParameters,
  PostFeedback,
  Response,
  EmptyResponse,
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
      type: { name: 'idea' },
      ...getProjectFilter('project', projectId),
      ...getDateFilter('created_date', startAtMoment, endAtMoment),
    },
  };

  const queryStatus: QuerySchema = {
    fact: 'post',
    groups: 'status.id',
    aggregations: {
      all: 'count',
      'status.title_multiloc': 'first',
      'status.color': 'first',
    },
    filters: {
      type: { name: 'idea' },
      ...getProjectFilter('project', projectId),
      ...getDateFilter('created_date', startAtMoment, endAtMoment),
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
        const pieCenterLabel = translations.feedbackGiven;

        const days = getDays(feedbackRow);

        const statusColorById = getStatusColorById(statusRows);
        const stackedBarColumns = statusRows.map((row) => row['status.id']);
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
          pieCenterLabel,
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
