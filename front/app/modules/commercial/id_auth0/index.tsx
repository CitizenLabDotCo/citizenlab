import React from 'react';
import {
  IDAuth0Method,
  TVerificationMethodName,
} from 'services/verificationMethods';
import { ModuleConfiguration } from 'utils/moduleUtils';
import isLastVerificationMethod from 'containers/Authentication/VerificationModal/isLastVerificationMethod';
import Auth0Button from './components/Auth0Button';

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
