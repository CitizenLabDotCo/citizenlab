import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';

const BosaFasButton = React.lazy(() => import('./components/BosaFasButton'));
import { isLastVerificationMethod } from 'api/verification_methods/util';
import { TVerificationMethodName } from 'api/verification_methods/types';

const verificationMethodName: TVerificationMethodName = 'bosa_fas';
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
        return <BosaFasButton last={last} method={method} {...otherProps} />;
      }

      return null;
    },
  },
};

export default configuration;
