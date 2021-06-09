import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import SimilarIdeas from './components/SimilarIdeas';
import { RenderOnFeatureFlag } from 'modules/utilComponents';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.IdeasShow.MetaInformation': (props) => (
      <RenderOnFeatureFlag featureFlagName="similar_ideas">
        <SimilarIdeas {...props} />
      </RenderOnFeatureFlag>
    ),
  },
};

export default configuration;
