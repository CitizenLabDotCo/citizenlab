import FeatureFlag from 'components/FeatureFlag';
import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
const SimilarIdeas = React.lazy(() => import('./components/SimilarIdeas'));
const FeatureFlag = React.lazy(() => import('components/FeatureFlag'));

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
