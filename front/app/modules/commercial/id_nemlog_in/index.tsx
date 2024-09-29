import React from 'react';

import { TVerificationMethodName } from 'api/verification_methods/types';
import { isLastVerificationMethod } from 'api/verification_methods/util';

import { ModuleConfiguration } from 'utils/moduleUtils';

const NemlogInButton = React.lazy(
  () => import('containers/Authentication/steps/_components/NemLogInButton')
);

const verificationMethodName: TVerificationMethodName = 'nemlog_in';
const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.VerificationModal.buttons': ({
      verificationMethods,
      ...otherProps
    }) => {
      const method = verificationMethods.find(
        (vm) => vm.attributes.name === verificationMethodName
      );

      // TODO: JS - different order to how they are displayed
      // So Nemlogin is always appearing as the last one in dev
      console.log(verificationMethods);

      if (method) {
        const last = isLastVerificationMethod(
          verificationMethodName,
          verificationMethods
        );
        return <NemlogInButton last={last} method={method} {...otherProps} />;
      }

      return null;
    },
  },
};

export default configuration;
