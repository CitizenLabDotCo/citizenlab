import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import SimilarIdeas from './components/SimilarIdeas';
import FeatureFlag from 'components/FeatureFlag';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.IdeasShow.MetaInformation': (props) => (
      <FeatureFlag name="similar_ideas">
        <SimilarIdeas {...props} />
      </FeatureFlag>
    ),
  },
};

export default configuration;
