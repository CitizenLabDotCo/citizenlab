import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';

const CowButton = React.lazy(() => import('./components/CowButton'));
const VerificationFormCOW = React.lazy(
  () => import('./components/VerificationFormCOW')
);
import { TVerificationMethodName } from 'api/verification_methods/types';
import { isLastVerificationMethod } from 'api/verification_methods/util';

const verificationMethodName: TVerificationMethodName = 'cow';
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
        return <CowButton last={last} method={method} {...otherProps} />;
      }

      return null;
    },
    'app.components.VerificationModal.methodSteps': ({
      method,
      activeStep,
      ...otherProps
    }) => {
      if (
        method?.attributes.name === verificationMethodName &&
        activeStep === 'method-step'
      ) {
        return <VerificationFormCOW {...otherProps} />;
      }

      return null;
    },
  },
};

export default configuration;
