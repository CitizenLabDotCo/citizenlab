import React from 'react';
import { TVerificationMethodName } from 'services/verificationMethods';
import { ModuleConfiguration } from 'utils/moduleUtils';
import VerificationFranceConnectButton from './components/VerificationFranceConnectButton';
import './services/verificationMethods';

const verificationMethodName: TVerificationMethodName = 'franceconnect';
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
        return (
          <VerificationFranceConnectButton method={method} {...otherProps} />
        );
      }

      return null;
    },
  },
};

export default configuration;
