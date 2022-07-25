import { useState, useEffect } from 'react';
import { postsAnalyticsStream } from '../../../services/analyticsFacts';

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
      },
    },
  },
});

type Response = {
  sum_feedback_none: number;
  sum_feedback_official: number;
  sum_feedback_status_change: number;
  'project.id': string;
};

export default function usePostsWithFeedback(projectId) {
  const [postsWithFeedback, setPostsWithFeedback] = useState<any>(undefined);
  useEffect(() => {
    if (projectId) {
      postsAnalyticsStream<Response>(query(projectId)).then((results) => {
        setPostsWithFeedback(results);
      });
    }
  }, [projectId]);

  return postsWithFeedback;
}
