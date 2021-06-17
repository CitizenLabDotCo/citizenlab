import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import './services/verificationMethods';
import Auth0Button from './components/Auth0Button';
import { IDAuth0Method } from 'services/verificationMethods';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.VerificationModal.button': (props) => {
      if (props.method.attributes.name !== 'auth0') return null;
      return <Auth0Button {...props} method={props.method as IDAuth0Method} />;
    },
  },
};

export default configuration;
