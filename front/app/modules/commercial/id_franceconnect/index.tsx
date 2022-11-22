import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import './services/verificationMethods';
const VerificationFranceConnectButton = React.lazy(
  () => import('./components/VerificationFranceConnectButton')
);
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
