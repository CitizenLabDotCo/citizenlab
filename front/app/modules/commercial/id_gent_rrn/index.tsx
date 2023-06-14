import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import './services/verificationMethods';
const GentRrnButton = React.lazy(() => import('./components/GentRrnButton'));
const VerificationFormGentRrn = React.lazy(
  () => import('./components/VerificationFormGentRrn')
);
import {
  isLastVerificationMethod,
  TVerificationMethodName,
} from 'services/verificationMethods';

const verificationMethodName: TVerificationMethodName = 'gent_rrn';
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
        return <GentRrnButton method={method} last={last} {...otherProps} />;
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
        return <VerificationFormGentRrn method={method} {...otherProps} />;
      }

      return null;
    },
  },
};

export default configuration;
