import React, { useEffect } from 'react';
import { Moment } from 'moment';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import ProposalsCard from '../components/ProposalsCard';

// typings
import { IResolution } from 'components/admin/ResolutionControl';

interface Props {
  projectId: string | undefined;
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null | undefined;
  resolution: IResolution;
  onMount: () => void;
}

export default ({ ...otherProps }: Props) => {
  const analyticsActive = useFeatureFlag({ name: 'analytics' });

  useEffect(() => {
    if (!analyticsActive) return;
  }, [analyticsActive]);

  if (!analyticsActive) return null;

  return <ProposalsCard {...otherProps} />;
};
