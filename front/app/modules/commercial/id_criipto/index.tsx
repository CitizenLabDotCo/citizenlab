import React from 'react';

import { TVerificationMethodName } from 'api/verification_methods/types';
import { isLastVerificationMethod } from 'api/verification_methods/util';

import { ModuleConfiguration } from 'utils/moduleUtils';

const SSOVerificationButton = React.lazy(
  () =>
    import('containers/Authentication/steps/_components/SSOVerificationButton')
);

const verificationMethodName: TVerificationMethodName = 'criipto';
const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.VerificationModal.buttons': ({
      verificationMethods,
      ...otherProps
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
          <SSOVerificationButton
            last={last}
            verificationMethod={method}
            {...otherProps}
          />
        );
      }

      return null;
    },
  },
};

export default configuration;
