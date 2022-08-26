import { useState, useEffect } from 'react';
import moment from 'moment';

// services
import {
  analyticsStream,
  Query,
  QuerySchema,
} from '../../services/analyticsFacts';

// hooks
// import useLocalize from 'hooks/useLocalize';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import {
  getTranslations,
  parsePieData,
  parseProgressBarsData,
  // parseStackedBarsData,
  getPieCenterValue,
  getDays,
  parseExcelData,
} from './parse';

// typings
import { Multiloc } from 'typings';
import { InjectedIntlProps } from 'react-intl';

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
}

// Hook return value
interface PostFeedback {
  pieData: PieRow[];
  progressBarsData: ProgressBarsRow[];
  stackedBarsData: StackedBarsRow[];
  pieCenterValue: string;
  pieCenterLabel: string;
  days: number;
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

type StackedBarsRow = Record<string, number>;

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
  // const localize = useLocalize();

  const [postsWithFeedback, setPostsWithFeedback] = useState<
    PostFeedback | NilOrError
  >(undefined);

  useEffect(() => {
    analyticsStream<Response>(query({ projectId, startAt, endAt })).then(
      (results: Response | NilOrError) => {
        if (isNilOrError(results)) {
          setPostsWithFeedback(results);
          return;
        }

        // const [feedbackRows, statusRows] = results.data;
        const [feedbackRows, _] = results.data;
        const feedbackRow = feedbackRows[0];

        const translations = getTranslations(formatMessage);

        const pieData = parsePieData(feedbackRow);
        const progressBarsData = parseProgressBarsData(
          feedbackRow,
          translations
        );
        // const stackedBarsData = parseStackedBarsData(statusRows);

        const pieCenterValue = getPieCenterValue(feedbackRow);
        const pieCenterLabel = translations.feedbackGiven;

        const days = getDays(feedbackRow);
        const xlsxData = parseExcelData(feedbackRow, translations);

        setPostsWithFeedback({
          pieData,
          progressBarsData,
          stackedBarsData: [],
          pieCenterValue,
          pieCenterLabel,
          days,
          xlsxData,
        });
      }
    );
  }, [projectId, startAt, endAt, formatMessage]);

  return postsWithFeedback;
}
