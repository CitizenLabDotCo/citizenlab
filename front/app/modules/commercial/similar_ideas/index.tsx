import useFeatureFlag from 'hooks/useFeatureFlag';
import React, { ReactNode } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import SimilarIdeas from './components/SimilarIdeas';

type RenderOnFeatureFlagProps = {
  children: ReactNode;
};

const RenderOnFeatureFlag = ({ children }: RenderOnFeatureFlagProps) => {
  const similarIdeasEnabled = useFeatureFlag('similar_ideas');
  if (similarIdeasEnabled) {
    return <>{children}</>;
  }
  return null;
};

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.IdeasShow.MetaInformation': (props) => (
      <RenderOnFeatureFlag>
        <SimilarIdeas {...props} />
      </RenderOnFeatureFlag>
    ),
  },
};

export default configuration;
