import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import './services/verificationMethods';
import VerificationFranceConnectButton from './components/VerificationFranceConnectButton';
import { isLastVerificationMethod } from 'modules/commercial/verification';

const verificationMethodName = 'franceconnect';
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
          <VerificationFranceConnectButton
            method={method}
            last={last}
            {...otherProps}
          />
        );
      }

      return null;
    },
  },
};

export default configuration;
