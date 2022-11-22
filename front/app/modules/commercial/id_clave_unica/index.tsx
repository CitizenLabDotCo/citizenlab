import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import './services/verificationMethods';
const ClaveUnicaButton = React.lazy(
  () => import('./components/ClaveUnicaButton')
);
import { isLastVerificationMethod } from 'modules/commercial/verification';
import React from 'react';
import { TVerificationMethodName } from 'services/verificationMethods';
import { ModuleConfiguration } from 'utils/moduleUtils';
import ClaveUnicaButton from './components/ClaveUnicaButton';
import './services/verificationMethods';

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
