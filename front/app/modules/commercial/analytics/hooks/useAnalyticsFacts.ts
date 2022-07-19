import { useState, useEffect } from 'react';
import { postsAnalyticsStream } from '../services/analyticsFacts';

const useAnalyticsPost = function (query) {
  const [analyticsPost, setAnalyticsPost] = useState<any>(undefined);

  useEffect(() => {
    postsAnalyticsStream(query).then((analyticsPost) =>
      setAnalyticsPost(analyticsPost)
    );
  }, []);

  return analyticsPost;
};

export default useAnalyticsPost;
