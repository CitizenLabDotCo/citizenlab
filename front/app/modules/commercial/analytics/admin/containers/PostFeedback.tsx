import React, { useEffect } from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import PostFeedbackCard from '../components/PostFeedbackCard';

interface Props {
  projectId: string | undefined;
  startAt: string | null | undefined;
  endAt: string | null | undefined;
  onMount: () => void;
}

export default ({ onMount, ...otherProps }: Props) => {
  const analyticsActive = useFeatureFlag({ name: 'analytics' });

  useEffect(() => {
    if (!analyticsActive) return;
    onMount();
  }, [analyticsActive, onMount]);

  if (!analyticsActive) return null;

  return <PostFeedbackCard {...otherProps} />;
};
