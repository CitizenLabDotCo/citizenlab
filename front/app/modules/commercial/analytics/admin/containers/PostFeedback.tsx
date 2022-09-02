import React from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import PostFeedback from '../components/PostFeedback';

interface Props {
  projectId: string | undefined;
  startAt: string | null | undefined;
  endAt: string | null;
}

export default (props: Props) => {
  const analyticsActive = useFeatureFlag({ name: 'analytics' });
  if (!analyticsActive) return null;
  return <PostFeedback {...props} />;
};
