import React, { lazy, Suspense } from 'react';

import {
  IDKeycloakMethod,
  TVerificationMethodName,
} from 'api/verification_methods/types';
import { isLastVerificationMethod } from 'api/verification_methods/util';

import { ModuleConfiguration } from 'utils/moduleUtils';

const SSOVerificationButton = lazy(
  () =>
    import('containers/Authentication/steps/_components/SSOVerificationButton')
);

const verificationMethodName: TVerificationMethodName = 'keycloak';
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
          <Suspense fallback={null}>
            <SSOVerificationButton
              verificationMethod={method as IDKeycloakMethod}
              last={last}
              {...props}
            />
          </Suspense>
        );
      }

      return null;
    },
  },
};

export default configuration;
