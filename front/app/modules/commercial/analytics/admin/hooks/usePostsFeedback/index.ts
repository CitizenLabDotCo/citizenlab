import { useState, useEffect } from 'react';
import moment from 'moment';

// services
import {
  analyticsStream,
  Query,
  QuerySchema,
} from '../../services/analyticsFacts';

// hooks
import useLocalize from 'hooks/useLocalize';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import {
  getTranslations,
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

// typings
import { Multiloc } from 'typings';
import { InjectedIntlProps } from 'react-intl';
import { LegendItem } from 'components/admin/Graphs/_components/Legend/typings';

interface QueryProps {
  projectId?: string;
  startAt?: string;
  endAt?: string;
}

// Response
export type Response = {
  data: [FeedbackRow[], StatusRow[]];
};

export interface FeedbackRow {
  sum_feedback_none: number;
  sum_feedback_official: number;
  sum_feedback_status_change: number;
  avg_feedback_time_taken: number;
}

export interface StatusRow {
  count: number;
  'status.id': string;
  first_status_title_multiloc: Multiloc;
  first_status_color: string;
}

// Hook return value
interface PostFeedback {
  pieData: PieRow[];
  progressBarsData: ProgressBarsRow[];
  stackedBarsData: [StackedBarsRow];
  pieCenterValue: string;
  pieCenterLabel: string;
  days: number;
  stackedBarColumns: string[];
  statusColorById: Record<string, string>;
  stackedBarPercentages: number[];
  stackedBarsLegendItems: LegendItem[];
  xlsxData: object;
}

interface PieRow {
  name: string;
  value: number;
  color: string;
}

interface ProgressBarsRow {
  name: string;
  label: string;
  value: number;
  total: number;
}

export type StackedBarsRow = Record<string, number>;

const toDate = (dateString: string) => moment(dateString).format('yyyy-MM-DD');

const query = ({ projectId, startAt, endAt }: QueryProps): Query => {
  const queryFeedback: QuerySchema = {
    fact: 'post',
    aggregations: {
      feedback_none: 'sum',
      feedback_official: 'sum',
      feedback_status_change: 'sum',
      feedback_time_taken: 'avg',
    },
    ...(projectId
      ? {
          dimensions: { project: { id: projectId } },
        }
      : {}),
    ...(startAt && endAt
      ? {
          created_date: {
            date: { from: toDate(startAt), to: toDate(endAt) },
          },
        }
      : {}),
  };

  const queryStatus: QuerySchema = {
    fact: 'post',
    groups: 'status.id',
    aggregations: {
      all: 'count',
      'status.title_multiloc': 'first',
      'status.color': 'first',
    },
  };

  return { query: [queryFeedback, queryStatus] };
};

export default function usePostsWithFeedback(
  formatMessage: InjectedIntlProps['intl']['formatMessage'],
  { projectId, startAt, endAt }: QueryProps
) {
  const localize = useLocalize();

  const [postsWithFeedback, setPostsWithFeedback] = useState<
    PostFeedback | NilOrError
  >(undefined);

  useEffect(() => {
    const { observable } = analyticsStream<Response>(
      query({ projectId, startAt, endAt })
    );
    const subscription = observable.subscribe(
      (results: Response | NilOrError) => {
        if (isNilOrError(results)) {
          setPostsWithFeedback(results);
          return;
        }

        const [feedbackRows, statusRows] = results.data;
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
  }, [projectId, startAt, endAt, formatMessage, localize]);

  return postsWithFeedback;
}
