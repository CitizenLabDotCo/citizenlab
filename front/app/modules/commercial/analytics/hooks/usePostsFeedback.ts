import { useState, useEffect } from 'react';

// services
import { analyticsStream, Query } from '../services/analyticsFacts';

// utils
import { sum, roundPercentage } from 'utils/math';

// typings
import { InjectedIntlProps } from 'react-intl';
import {
  Response,
  PostFeedback,
} from '../admin/components/PostFeedback/typings';

// i18n
import messages from '../admin/components/PostFeedback/messages';

const query = (projectId?: string): { query: Query[] } => {
  const groups = {
    fact: 'post',
    aggregations: {
      feedback_none: 'sum',
      feedback_official: 'sum',
      feedback_status_change: 'sum',
      feedback_time_taken: 'avg',
    },
  };

  const dimensions = !projectId
    ? {}
    : { dimensions: { project: { id: projectId } } };

  const query_feedback = { ...groups, ...dimensions };
  const query_status = {
    fact: 'post',
    groups: 'status.id',
    aggregations: {
      all: 'count',
      'status.title_multiloc': 'first',
    },
  };

  return { query: [query_feedback, query_status] as Query[] };
};

export default function usePostsWithFeedback(
  formatMessage: InjectedIntlProps['intl']['formatMessage'],
  projectId?: string
) {
  const [postsWithFeedback, setPostsWithFeedback] = useState<
    PostFeedback | undefined
  >(undefined);
  useEffect(() => {
    analyticsStream<Response>(query(projectId)).then((results) => {
      if (results && results.data.length > 0) {
        const [response_feedback, _] = results.data;

        const result_feedback = response_feedback[0];

        const {
          sum_feedback_none,
          sum_feedback_official,
          sum_feedback_status_change,
          avg_feedback_time_taken,
        } = result_feedback;

        const feedback_count = sum([
          sum_feedback_official,
          sum_feedback_status_change,
        ]);
        const total = sum([feedback_count, sum_feedback_none]);

        const feedbackPercent = feedback_count / total;
        const pieCenterValue = `${Math.round(feedbackPercent * 100)}%`;
        const pieCenterLabel = formatMessage(messages.feedbackGiven);

        const days = Math.round(avg_feedback_time_taken / 86400);

        const statusChanged = formatMessage(messages.statusChanged);
        const officialUpdate = formatMessage(messages.officialUpdate);

        const pieData = [
          { name: 'sum_feedback', value: feedback_count, color: '#40B8C5' },
          {
            name: 'sum_no_feedback',
            value: sum_feedback_none,
            color: '#E0E0E0',
          },
        ];

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

        const xlsxDataSheet1Row1 = {};
        xlsxDataSheet1Row1[formatMessage(messages.feedbackGiven)] =
          feedback_count;
        xlsxDataSheet1Row1[formatMessage(messages.statusChanged)] =
          sum_feedback_status_change;
        xlsxDataSheet1Row1[formatMessage(messages.officialUpdate)] =
          sum_feedback_official;
        xlsxDataSheet1Row1[formatMessage(messages.total)] = total;

        const xlsxDataSheet2Row1 = {};
        xlsxDataSheet2Row1[formatMessage(messages.averageTimeColumnName)] =
          days;

        const xlsxData = {};
        xlsxData[formatMessage(messages.postFeedback)] = [xlsxDataSheet1Row1];
        xlsxData[formatMessage(messages.responseTime)] = [xlsxDataSheet2Row1];

        setPostsWithFeedback({
          pieData,
          pieCenterValue,
          pieCenterLabel,
          days,
          progressBarsData,
          xlsxData,
        });
      } else {
        setPostsWithFeedback(undefined);
      }
    });
  }, [projectId, formatMessage]);

  return postsWithFeedback;
}
