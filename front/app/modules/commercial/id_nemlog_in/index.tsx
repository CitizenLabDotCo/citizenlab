import React from 'react';

import { TVerificationMethodName } from 'api/verification_methods/types';
import { isLastVerificationMethod } from 'api/verification_methods/util';

import { ModuleConfiguration } from 'utils/moduleUtils';

const MitIdButton = React.lazy(
  () => import('containers/Authentication/steps/_components/MitIdButton')
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

      if (method) {
        const last = isLastVerificationMethod(
          verificationMethodName,
          verificationMethods
        );
        return <MitIdButton last={last} method={method} {...otherProps} />;
      }

      return null;
    },
  },
};

export default configuration;
