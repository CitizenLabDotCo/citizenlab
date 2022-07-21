import { useState, useEffect } from 'react';
import { postsAnalyticsStream } from '../services/analyticsFacts';

export default function usePostsWithFeedback(projectId) {
  const [postsWithFeedback, setPostsWithFeedback] = useState<any>(undefined);
  useEffect(() => {
    postsAnalyticsStream({
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
    }).then((results) => {
      setPostsWithFeedback(results);
    });
  }, [projectId]);

  return postsWithFeedback;
}
