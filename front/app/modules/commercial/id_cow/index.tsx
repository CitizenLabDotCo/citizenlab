import React from 'react';
import './services/verificationMethods';
import { TVerificationMethodName } from 'services/verificationMethods';
import { ModuleConfiguration } from 'utils/moduleUtils';
import isLastVerificationMethod from 'containers/Authentication/VerificationModal/isLastVerificationMethod';

const CowButton = React.lazy(() => import('./components/CowButton'));
const VerificationFormCOW = React.lazy(
  () => import('./components/VerificationFormCOW')
);

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
