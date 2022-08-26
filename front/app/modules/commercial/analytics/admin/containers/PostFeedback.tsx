import React from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import PostFeedback from '../components/PostFeedback';

export default (props) => {
  const analyticsActive = useFeatureFlag({ name: 'analytics' });
  if (!analyticsActive) return null;
  return <PostFeedback {...props} />;
};
