import React from 'react';

import {
  IDTwodayMethod,
  TVerificationMethodName,
} from 'api/verification_methods/types';
import { isLastVerificationMethod } from 'api/verification_methods/util';

import SSOVerificationButton from 'containers/Authentication/steps/_components/SSOVerificationButton';

import { ModuleConfiguration } from 'utils/moduleUtils';

const verificationMethodName: TVerificationMethodName = 'twoday';
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
          <SSOVerificationButton
            verificationMethod={method as IDTwodayMethod}
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
