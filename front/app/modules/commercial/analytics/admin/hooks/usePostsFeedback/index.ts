import { useState, useEffect } from 'react';

// services
import {
  analyticsStream,
  Query,
  QuerySchema,
  Response,
} from '../../services/analyticsFacts';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import {
  getTranslations,
  parsePieData,
  parseProgressBarsData,
  parseExcelData,
  getPieCenterValue,
  getDays,
} from './parse';

// typings
import { InjectedIntlProps } from 'react-intl';

type PostFeedback = {
  pieData: PieRow[];
  pieCenterValue: string;
  pieCenterLabel: string;
  progressBarsData: ProgressBarsRow[];
  days: number;
  xlsxData: object;
};

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

const query = (projectId?: string): Query => {
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
  };

  const queryStatus: QuerySchema = {
    fact: 'post',
    groups: 'status.id',
    aggregations: {
      all: 'count',
      'status.title_multiloc': 'first',
    },
  };

  return { query: [queryFeedback, queryStatus] };
};

export default function usePostsWithFeedback(
  formatMessage: InjectedIntlProps['intl']['formatMessage'],
  projectId?: string
) {
  const [postsWithFeedback, setPostsWithFeedback] = useState<
    PostFeedback | NilOrError
  >(undefined);
  useEffect(() => {
    analyticsStream(query(projectId)).then((results: Response | NilOrError) => {
      if (isNilOrError(results)) {
        setPostsWithFeedback(results);
        return;
      }

      const [feedbackRows] = results.data;
      const feedbackRow = feedbackRows[0];

      const translations = getTranslations(formatMessage);

      const pieData = parsePieData(feedbackRow);
      const pieCenterValue = getPieCenterValue(feedbackRow);
      const pieCenterLabel = translations.feedbackGiven;

      const days = getDays(feedbackRow);

      const progressBarsData = parseProgressBarsData(feedbackRow, translations);
      const xlsxData = parseExcelData(feedbackRow, translations);

      setPostsWithFeedback({
        pieData,
        pieCenterValue,
        pieCenterLabel,
        days,
        progressBarsData,
        xlsxData,
      });
    });
  }, [projectId, formatMessage]);

  return postsWithFeedback;
}
