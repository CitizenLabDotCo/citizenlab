import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import './services/verificationMethods';
import Auth0Button from './components/Auth0Button';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.VerificationModal.button': (props) => {
      if (props.method.attributes.name !== 'auth0') return null;
      return <Auth0Button {...props} />;
    },
  },
};

export default configuration;
