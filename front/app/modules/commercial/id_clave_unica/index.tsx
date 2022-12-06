import React from 'react';
import './services/verificationMethods';
import { TVerificationMethodName } from 'services/verificationMethods';
import { ModuleConfiguration } from 'utils/moduleUtils';
import isLastVerificationMethod from 'containers/Authentication/VerificationModal/isLastVerificationMethod';

const ClaveUnicaButton = React.lazy(
  () => import('./components/ClaveUnicaButton')
);

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
