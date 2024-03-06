import React from 'react';

import FeatureFlag from 'components/FeatureFlag';

import { ModuleConfiguration } from 'utils/moduleUtils';

import ViennaSamlButton from './components/ViennaSamlButton';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.SignUpIn.AuthProviders.ContainerStart': (props) => {
      return (
        <FeatureFlag name="vienna_citizen_login">
          <ViennaSamlButton {...props} />
        </FeatureFlag>
      );
    },
  },
};

export default configuration;
