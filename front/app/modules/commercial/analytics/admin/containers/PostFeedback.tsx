import React, { useEffect } from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import PostFeedback from '../components/PostFeedback';

interface Props {
  projectId: string | undefined;
  startAt: string | null | undefined;
  endAt: string | null;
  onMount: () => void;
}

const Inner = ({ onMount, ...otherProps }: Props) => {
  useEffect(() => {
    onMount();
  }, [onMount]);

  return <PostFeedback {...otherProps} />;
};

const FeatureFlagWrapper = (props: Props) => {
  const analyticsActive = useFeatureFlag({ name: 'analytics' });
  if (!analyticsActive) return null;

  return <Inner {...props} />;
};

export default FeatureFlagWrapper;
