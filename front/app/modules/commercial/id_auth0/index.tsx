import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import {
  IDAuth0Method,
  TVerificationMethodName,
} from 'services/verificationMethods';
import Auth0Button from './components/Auth0Button';
import { isLastVerificationMethod } from 'services/verificationMethods';

const verificationMethodName: TVerificationMethodName = 'auth0';
const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.VerificationModal.buttons': ({
      verificationMethods,
      ...props
    }) => {
      const method = verificationMethods.find(
        (vm) => vm.attributes.name === verificationMethodName
      );

      if (method) {
        const last = isLastVerificationMethod(
          verificationMethodName,
          verificationMethods
        );
        return (
          <Auth0Button
            verificationMethod={method as IDAuth0Method}
            last={last}
            {...props}
          />
        );
      }

      return null;
    },
  },
};

export default configuration;
