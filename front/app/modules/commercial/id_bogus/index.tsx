import React from 'react';
import './services/verificationMethods';
import { ModuleConfiguration } from 'utils/moduleUtils';
import isLastVerificationMethod from 'containers/Authentication/VerificationModal/isLastVerificationMethod';

const BogusButton = React.lazy(() => import('./components/BogusButton'));
const VerificationFormBogus = React.lazy(
  () => import('./components/VerificationFormBogus')
);

const verificationMethodName = 'bogus';
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

        return <BogusButton last={last} method={method} {...otherProps} />;
      }

      return null;
    },
    'app.components.VerificationModal.methodSteps': ({
      method,
      activeStep,
      ...otherProps
    }) => {
      if (
        activeStep === 'method-step' &&
        method?.attributes.name === verificationMethodName
      ) {
        return <VerificationFormBogus {...otherProps} />;
      }

      return null;
    },
  },
};

export default configuration;
