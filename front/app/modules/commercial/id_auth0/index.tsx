import React from 'react';

import {
  IDAuth0Method,
  TVerificationMethodName,
} from 'api/verification_methods/types';
import { isLastVerificationMethod } from 'api/verification_methods/util';

import { ModuleConfiguration } from 'utils/moduleUtils';

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
