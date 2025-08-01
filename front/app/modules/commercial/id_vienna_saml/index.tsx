import React, { lazy, Suspense } from 'react';

import { ModuleConfiguration } from 'utils/moduleUtils';

import ViennaSamlButton from './components/ViennaSamlButton';

const FeatureFlag = lazy(() => import('components/FeatureFlag'));

const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.SignUpIn.AuthProviders.ContainerStart': (props) => {
      return (
        <Suspense fallback={null}>
          <FeatureFlag name="vienna_citizen_login">
            <ViennaSamlButton {...props} />
          </FeatureFlag>
        </Suspense>
      );
    },
  },
};

export default configuration;
