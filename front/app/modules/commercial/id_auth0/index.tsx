import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import './services/verificationMethods';
import Auth0Button from './components/Auth0Button';

// note dependency on
const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.VerificationModal.buttons': (props) => {
      return <Auth0Button {...props} />;
    },
  },
};

export default configuration;
