import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import ViennaSamlButton from './components/ViennaSamlButton';
import FeatureFlag from 'components/FeatureFlag';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.SignUpIn.AuthProviders.ContainerEnd': (props) => {
      return (
        <FeatureFlag name="vienna_login">
          <ViennaSamlButton {...props} />
        </FeatureFlag>
      );
    },
  },
};

export default configuration;
