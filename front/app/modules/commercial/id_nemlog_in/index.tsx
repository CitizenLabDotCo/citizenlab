import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';

const NemLogInButton = React.lazy(() => import('./components/NemLogInButton'));
import { isLastVerificationMethod } from 'api/verification_methods/util';
import { TVerificationMethodName } from 'api/verification_methods/types';

const verificationMethodName: TVerificationMethodName = 'nemlog_in';
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
        return <NemLogInButton last={last} method={method} {...otherProps} />;
      }

      return null;
    },
  },
};

export default configuration;
