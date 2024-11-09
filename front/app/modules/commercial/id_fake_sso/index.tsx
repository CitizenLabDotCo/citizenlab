import React from 'react';

import {
  IDFakeSSOMethod,
  TVerificationMethodName,
} from 'api/verification_methods/types';
import { isLastVerificationMethod } from 'api/verification_methods/util';

import { ModuleConfiguration } from 'utils/moduleUtils';

import SSOVerificationButton from 'containers/Authentication/steps/_components/SSOVerificationButton';

const verificationMethodName: TVerificationMethodName = 'fake_sso';
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
            verificationMethod={method as IDFakeSSOMethod}
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
