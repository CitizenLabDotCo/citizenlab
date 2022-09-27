import React, { useEffect } from 'react';
import { Moment } from 'moment';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import PostFeedbackCard from '../components/PostFeedbackCard';

// typings
import { IResolution } from 'components/admin/ResolutionControl';

interface Props {
  projectId: string | undefined;
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null | undefined;
  resolution: IResolution;
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
