import React from 'react';

import {
  IDIdAustriaMethod,
  TVerificationMethodName,
} from 'api/verification_methods/types';
import { isLastVerificationMethod } from 'api/verification_methods/util';

import { ModuleConfiguration } from 'utils/moduleUtils';

import IdAustriaButton from './components/IdAustriaButton';

const verificationMethodName: TVerificationMethodName = 'id_austria';
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
          <IdAustriaButton
            verificationMethod={method as IDIdAustriaMethod}
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
