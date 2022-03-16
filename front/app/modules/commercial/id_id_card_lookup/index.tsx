import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import './services/verificationMethods';
import IdCardLookupButton from './components/IdCardLookupButton';
import IdCardLookupForm from './components/IdCardLookupForm';
import {
  IDLookupMethod,
  TVerificationMethodName,
} from 'services/verificationMethods';
import { isLastVerificationMethod } from 'modules/commercial/verification';

const verificationMethodName: TVerificationMethodName = 'id_card_lookup';
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
          <IdCardLookupButton
            last={last}
            method={method as IDLookupMethod}
            {...otherProps}
          />
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
        activeStep === 'method-step' &&
        method?.attributes.name === verificationMethodName
      ) {
        return (
          <IdCardLookupForm method={method as IDLookupMethod} {...otherProps} />
        );
      }

      return null;
    },
  },
};

export default configuration;
