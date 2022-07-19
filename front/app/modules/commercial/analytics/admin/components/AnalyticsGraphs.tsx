import React from 'react';
import useAnalyticsPost from '../../hooks/useAnalyticsFacts';
export default () => {
  const query = {
    query: {
      groups: {
        key: 'type.name',
        aggregations: {
          votes_count: 'sum',
        },
      },
    },
  };
  const post = useAnalyticsPost(query);
  return <div>{JSON.stringify(post)}</div>;
};
