import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import { IDAuth0Method } from 'services/verificationMethods';
import Auth0Button from './components/Auth0Button';

// note dependency on
const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.VerificationModal.buttonss': ({
      verificationMethods,
      ...props
    }) => {
      const auth0VerificationMethod = verificationMethods.find(
        (vm) => vm.attributes.name === 'auth0'
      );

      if (auth0VerificationMethod) {
        return (
          <Auth0Button
            verificationMethod={auth0VerificationMethod as IDAuth0Method}
            {...props}
          />
        );
      }

      return null;
    },
  },
};

export default configuration;
