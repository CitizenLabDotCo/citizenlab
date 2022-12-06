import React from 'react';
import './services/verificationMethods';
import { TVerificationMethodName } from 'services/verificationMethods';
import { ModuleConfiguration } from 'utils/moduleUtils';
import isLastVerificationMethod from 'containers/Authentication/VerificationModal/isLastVerificationMethod';

const BosaFasButton = React.lazy(() => import('./components/BosaFasButton'));

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
