import { useState, useEffect } from 'react';

// services
import {
  analyticsStream,
  Query,
  QuerySchema,
} from '../../services/analyticsFacts';

// hooks
import useLocalize from 'hooks/useLocalize';

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
import { WrappedComponentProps } from 'react-intl';
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
  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();

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
      ...getDateFilter('created_date', startAt, endAt),
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
      ...getDateFilter('created_date', startAt, endAt),
    },
  };

  return { query: [queryFeedback, queryStatus] };
};

export default function usePostsWithFeedback(
  formatMessage: WrappedComponentProps['intl']['formatMessage'],
  { projectId, startAtMoment, endAtMoment }: QueryParameters
) {
  const localize = useLocalize();

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
