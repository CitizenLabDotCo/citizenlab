import { isLastVerificationMethod } from 'modules/commercial/verification';
import React from 'react';
import { TVerificationMethodName } from 'services/verificationMethods';
import { ModuleConfiguration } from 'utils/moduleUtils';
import GentRrnButton from './components/GentRrnButton';
import VerificationFormGentRrn from './components/VerificationFormGentRrn';
import './services/verificationMethods';

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
