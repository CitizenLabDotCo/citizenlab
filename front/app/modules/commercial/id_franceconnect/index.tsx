import React from 'react';

import { ModuleConfiguration } from 'utils/moduleUtils';

const VerificationFranceConnectButton = React.lazy(
  () => import('./components/VerificationFranceConnectButton')
);
import { TVerificationMethodName } from 'api/verification_methods/types';

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
