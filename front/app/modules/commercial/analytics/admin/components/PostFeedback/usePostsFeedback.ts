import { useState, useEffect } from 'react';
import { postsAnalyticsStream } from '../../../services/analyticsFacts';
import { sum, roundPercentage } from 'utils/math';

const query = (projectId) => ({
  query: {
    dimensions: {
      project: {
        id: projectId,
      },
    },
    groups: {
      key: 'project.id',
      aggregations: {
        feedback_none: 'sum',
        feedback_official: 'sum',
        feedback_status_change: 'sum',
        feedback_time_taken: 'avg',
      },
    },
  },
});

type Response = {
  sum_feedback_none: number;
  sum_feedback_official: number;
  sum_feedback_status_change: number;
  'project.id': string;
  avg_feedback_time_taken: number;
};

export default function usePostsWithFeedback(projectId) {
  const [postsWithFeedback, setPostsWithFeedback] = useState<any>(undefined);
  useEffect(() => {
    if (projectId) {
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

          const serie = [
            { name: 'sum_feedback', value: feedback_count, color: '#40B8C5' },
            {
              name: 'sum_no_feedback',
              value: sum_feedback_none,
              color: '#E0E0E0',
            },
          ];

          const feedbackPercent = feedback_count / total;
          const avgTime = Math.round(avg_feedback_time_taken / 86400);

          const progressBars = [
            {
              name: 'Status changed',
              label: `Status changed: ${sum_feedback_status_change} (${roundPercentage(
                sum_feedback_status_change,
                total
              )}%)`,
              value: sum_feedback_status_change,
              total,
            },
            {
              name: 'Official update',
              label: `Official update: ${sum_feedback_official} (${roundPercentage(
                sum_feedback_official,
                total
              )}%)`,
              value: sum_feedback_official,
              total,
            },
          ];
          setPostsWithFeedback({
            serie,
            feedbackPercent,
            avgTime,
            progressBars,
          });
        }
      });
    }
  }, [projectId]);

  return postsWithFeedback;
}
