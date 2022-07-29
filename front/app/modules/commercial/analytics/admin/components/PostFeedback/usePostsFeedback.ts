import { useState, useEffect } from 'react';

// services
import { postsAnalyticsStream, Query } from '../../../services/analyticsFacts';

// utils
import { sum, roundPercentage } from 'utils/math';

// typings
import { InjectedIntlProps } from 'react-intl';
import { Response, PostFeedback } from './typings';

// i18n
import messages from './messages';

const query = (projectId?: string): Query => {
  const groups = {
    groups: {
      key: 'project.id',
      aggregations: {
        feedback_none: 'sum',
        feedback_official: 'sum',
        feedback_status_change: 'sum',
        feedback_time_taken: 'avg',
      },
    },
  };

  const dimensions = !projectId
    ? {}
    : { dimensions: { project: { id: projectId } } };

  const query = { query: { ...groups, ...dimensions } };

  return query as Query;
};

export default function usePostsWithFeedback(
  formatMessage: InjectedIntlProps['intl']['formatMessage'],
  projectId?: string
) {
  const [postsWithFeedback, setPostsWithFeedback] = useState<
    PostFeedback | undefined
  >(undefined);
  useEffect(() => {
    postsAnalyticsStream<Response>(query(projectId)).then((results) => {
      if (results && results.data.length > 0) {
        const {
          sum_feedback_none,
          sum_feedback_official,
          sum_feedback_status_change,
          avg_feedback_time_taken,
        } = results.data[0];

        const feedback_count = sum([
          sum_feedback_official,
          sum_feedback_status_change,
        ]);
        const total = sum([feedback_count, sum_feedback_none]);

        const feedbackPercent = feedback_count / total;
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
        setPostsWithFeedback({
          pieData,
          feedbackPercent,
          days,
          progressBarsData,
        });
      }
    });
  }, [projectId, formatMessage]);

  return postsWithFeedback;
}
