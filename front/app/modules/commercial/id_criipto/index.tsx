import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import {
  IDCriiptoMethod,
  TVerificationMethodName,
} from 'api/verification_methods/types';
import CriiptoButton from './components/CriiptoButton';
import { isLastVerificationMethod } from 'api/verification_methods/util';

const verificationMethodName: TVerificationMethodName = 'criipto';
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
          <CriiptoButton
            verificationMethod={method as IDCriiptoMethod}
            last={last}
            {...props}
          />
        );
      }

      return null;
    },
  },
};

export default configuration;
