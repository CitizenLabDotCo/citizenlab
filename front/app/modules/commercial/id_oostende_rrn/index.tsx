import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
const OostendeRrnButton = React.lazy(
  () => import('./components/OostendeRrnButton')
);
const VerificationFormOostendeRrn = React.lazy(
  () => import('./components/VerificationFormOostendeRrn')
);
import { TVerificationMethodName } from 'api/verification_methods/types';
import { isLastVerificationMethod } from 'api/verification_methods/util';

const verificationMethodName: TVerificationMethodName = 'oostende_rrn';
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
          <OostendeRrnButton method={method} last={last} {...otherProps} />
        );
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
        return <VerificationFormOostendeRrn method={method} {...otherProps} />;
      }

      return null;
    },
  },
};

export default configuration;
