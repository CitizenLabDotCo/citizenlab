import { useState, useEffect } from 'react';
import { postsAnalyticsStream } from '../../../services/analyticsFacts';
import { sum } from 'utils/helperUtils';

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

          const feedback_count = sum(
            sum_feedback_official,
            sum_feedback_status_change
          );
          const total = sum(feedback_count, sum_feedback_none);

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
          setPostsWithFeedback({ serie, feedbackPercent, avgTime });
        }
      });
    }
  }, [projectId]);

  return postsWithFeedback;
}
