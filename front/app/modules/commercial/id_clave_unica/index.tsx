import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import './services/verificationMethods';
const ClaveUnicaButton = React.lazy(
  () => import('./components/ClaveUnicaButton')
);
import { isLastVerificationMethod } from 'services/verificationMethods';
import { TVerificationMethodName } from 'services/verificationMethods';

const verificationMethodName: TVerificationMethodName = 'clave_unica';
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
        return <ClaveUnicaButton last={last} method={method} {...otherProps} />;
      }

      return null;
    },
  },
};

export default configuration;
